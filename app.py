from flask import Flask, request, jsonify, Response
import requests
import json
import re
from datetime import datetime
import pytz
from flask_cors import CORS

app = Flask(__name__)
CORS(app)

LLM_ENDPOINT = "http://192.168.1.51:1234/v1/chat/completions"
CALENDAR_API = "http://localhost:8080/calendarManagement"
BOOKING_API = "http://localhost:8080/requestManagement"

# JSON Schema cho intent output
INTENT_SCHEMA = {
    "$schema": "http://json-schema.org/draft-07/schema#",
    "title": "Intent Output",
    "type": "object",
    "properties": {
        "type": {
            "type": "string",
            "enum": [
                "calendar",
                "booking",
                "other"
            ],
            "description": "Intent type: calendar, booking, or other"
        }
    },
    "required": [
        "type"
    ],
    "additionalProperties": False
}

SYSTEM_PROMPT = (
    "Bạn là một AI phân loại ý định người dùng. Hãy đọc câu hỏi và trả về kết quả dưới dạng JSON hợp lệ với key duy nhất là 'type'. "
    "Các type có thể là: 'calendar' (hỏi về lịch phòng, lịch thực hành), 'booking' (hỏi về các yêu cầu đặt phòng), 'other' (các trường hợp còn lại). "
    "Chỉ trả về JSON hợp lệ, không giải thích gì thêm."
)

WEEKDAY_MAP = {
    0: "Thứ 2",
    1: "Thứ 3",
    2: "Thứ 4",
    3: "Thứ 5",
    4: "Thứ 6",
    5: "Thứ 7",
    6: "Chủ nhật"
}

def ask_llm_with_schema(prompt, system_prompt, json_schema, model="qwen3-1.7b", temperature=0, max_tokens=128):
    messages = [
        {"role": "system", "content": system_prompt},
        {"role": "user", "content": prompt}
    ]
    payload = {
        "model": model,
        "messages": messages,
        "temperature": temperature,
        "max_tokens": max_tokens,
        "response_format": {
            "type": "json_schema",
            "json_schema": json_schema
        }
    }
    response = requests.post(LLM_ENDPOINT, json=payload)
    response.raise_for_status()
    data = response.json()
    return data['choices'][0]['message']['content']

def classify_intent_llm(prompt):
    system_prompt = (
        "Bạn là một AI phân loại ý định người dùng. Hãy đọc câu hỏi và trả về kết quả dưới dạng JSON hợp lệ với 2 key: 'type' và 'value'. "
        "Các type có thể là: 'calendar' (hỏi về lịch phòng, lịch thực hành, lịch dạy, ngày dạy, môn trong ngày cụ thể, giáo viên dạy cụ thể, lịch thực hành cụ thể), 'booking' (hỏi về các yêu cầu đặt phòng), 'general' (câu hỏi chung), 'date_query' (truy vấn ngày/tuần/thời gian). "
        "Nếu là 'date_query', value là object gồm 'date_type' (day/week/far_time) và 'date_value' (chuỗi hoặc mảng ngày/tuần). "
        "Chỉ trả về JSON hợp lệ, không giải thích gì thêm."
    )
    content = ask_llm_with_schema(prompt, system_prompt, INTENT_SCHEMA)
    try:
        result = json.loads(content)
        return result
    except Exception:
        return {"type": "general", "value": ""}

def ask_llm(prompt, context=None):
    messages = [
        {"role": "system", "content": "Bạn là trợ lý quản lý phòng thực hành. Hãy trả lời dựa trên dữ liệu nếu có."}
    ]
    if context:
        messages.append({"role": "system", "content": f"Dữ liệu: {context}"})
    messages.append({"role": "user", "content": prompt})

    payload = {
        "model": "qwen3-1.7b",
        "messages": messages,
        "temperature": 0.7
    }
    response = requests.post(LLM_ENDPOINT, json=payload)
    response.raise_for_status()
    data = response.json()
    return data['choices'][0]['message']['content']

def get_calendar_data(access_token):
    headers = {
        "Authorization": f"Bearer {access_token}",
        "Accept": "application/json"
    }
    response = requests.get(CALENDAR_API, headers=headers)
    response.raise_for_status()
    return response.json()["data"]

def get_booking_data(access_token):
    headers = {
        "Authorization": f"Bearer {access_token}",
        "Accept": "application/json"
    }
    response = requests.get(BOOKING_API, headers=headers)
    response.raise_for_status()
    return response.json()["data"]

# Hàm làm sạch dữ liệu lịch phòng
def clean_calendar_data(calendar_data):
    weekday_map = {
        "2": "Thứ 2",
        "3": "Thứ 3",
        "4": "Thứ 4",
        "5": "Thứ 5",
        "6": "Thứ 6",
        "7": "Thứ 7",
        "8": "Chủ nhật"
    }
    cleaned = []
    for item in calendar_data:
        cleaned.append({
            "Môn học": item.get("nameSubject", ""),
            "Giáo viên": item.get("nameTeacher", ""),
            "Phòng": item.get("nameRoom", ""),
            "Ngày": item.get("date", ""),
            "Thứ": weekday_map.get(str(item.get("day", "")), item.get("day", "")),
            "Trạng thái": item.get("statusCalendar", "")
        })
    return cleaned

# Generator để stream response từ LLM về FE
def stream_llm_response(payload):
    with requests.post(LLM_ENDPOINT, json=payload, stream=True) as r:
        r.raise_for_status()
        for line in r.iter_lines():
            if line:
                try:
                    data = json.loads(line.decode('utf-8'))
                    # Tùy vào format của LLM, có thể cần điều chỉnh dòng dưới
                    content = data.get("choices", [{}])[0].get("delta", {}).get("content", "")
                    if content:
                        print(f"[LOG] Stream chunk: {content}")
                        yield content
                except Exception as e:
                    print(f"[LOG] Stream parse error: {e}, line: {line}")

@app.route('/chat', methods=['POST'])
def chat():
    prompt = request.json.get("prompt")
    access_token = request.args.get("accessToken")
    if not prompt:
        print("[LOG] Missing prompt")
        return jsonify({"error": "Missing prompt"}), 400

    # Step 1: Phân loại intent
    messages = [
        {"role": "system", "content": SYSTEM_PROMPT},
        {"role": "user", "content": prompt}
    ]
    payload = {
        "model": "qwen3-1.7b",
        "messages": messages,
        "temperature": 0
    }
    response = requests.post(LLM_ENDPOINT, json=payload)
    response.raise_for_status()
    data = response.json()
    content = data['choices'][0]['message']['content']
    try:
        result = json.loads(content)
    except Exception:
        match = re.search(r'\{.*\}', content, re.DOTALL)
        if match:
            try:
                result = json.loads(match.group(0))
            except Exception:
                print(f"[LOG] Invalid JSON output from LLM: {content}")
                return jsonify({"error": "Invalid JSON output from LLM", "raw": content}), 500
        else:
            print(f"[LOG] Invalid JSON output from LLM: {content}")
            return jsonify({"error": "Invalid JSON output from LLM", "raw": content}), 500

    intent_type = result.get("type", "other")
    print(f"[LOG] Intent detected: {intent_type}")

    # Step 2: Nếu intent là calendar, lấy ngày, thứ, data và hỏi lại LLM (stream)
    if intent_type == "calendar":
        if not access_token:
            print("[LOG] Missing accessToken for calendar query")
            return jsonify({"error": "Missing accessToken for calendar query"}), 400
        try:
            headers = {
                "Authorization": f"Bearer {access_token}",
                "Accept": "application/json"
            }
            calendar_response = requests.get(CALENDAR_API, headers=headers)
            calendar_response.raise_for_status()
            calendar_json = calendar_response.json()
            calendar_data = calendar_json.get("data", [])
            cleaned_data = clean_calendar_data(calendar_data)
            print(f"[LOG] Cleaned calendar data: {cleaned_data}")
        except Exception as e:
            print(f"[LOG] Failed to get calendar data: {str(e)}")
            return jsonify({"error": f"Failed to get calendar data: {str(e)}"}), 500
        # Lấy ngày và thứ hiện tại ở Việt Nam
        vn_tz = pytz.timezone('Asia/Ho_Chi_Minh')
        now = datetime.now(vn_tz)
        today_str = now.strftime('%d-%m-%Y')
        weekday_str = WEEKDAY_MAP[now.weekday()]
        print(f"[LOG] Today in Vietnam: {today_str}, Weekday: {weekday_str}")
        # Tạo prompt mới: ngày, thứ, data, prompt user, /no_thinking
        calendar_context = f"Ngày hiện tại ở Việt Nam: {today_str}\nThứ hiện tại ở Việt Nam: {weekday_str}\nDữ liệu lịch phòng: {json.dumps(cleaned_data, ensure_ascii=False)}\n\n"
        answer_prompt = calendar_context + prompt + "\n/no_thinking"
        print(f"[LOG] Prompt gửi tới AI (qwen3-4b): {answer_prompt}")
        answer_messages = [
            {"role": "system", "content": "Bạn là trợ lý quản lý phòng thực hành. Hãy trả lời dựa trên dữ liệu lịch phòng bên dưới.Trả lời một cách đầy đủ thông tin và tổng quan bám xát vào câu hỏi người dùng đặt ra nhé"},
            {"role": "user", "content": answer_prompt}
        ]
        answer_payload = {
            "model": "qwen3-4b",
            "messages": answer_messages,
            "temperature": 0.7,
            "stream": True
        }
        return Response(stream_llm_response(answer_payload), mimetype='text/plain')
    else:
        return jsonify({"type": intent_type})

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5001 , debug=True)
