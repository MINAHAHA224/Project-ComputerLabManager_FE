from flask import Flask, request, jsonify, Response
import requests
import json
import re
from datetime import datetime
import pytz
import redis
import hashlib
from flask_cors import CORS

app = Flask(__name__)
CORS(app)

# Redis connection
try:
    redis_client = redis.Redis(host='localhost', port=6379, db=0, decode_responses=True)
    redis_client.ping()
    print("[LOG] Redis connected successfully")
except Exception as e:
    print(f"[LOG] Redis connection failed: {e}")
    redis_client = None

LLM_ENDPOINT = "http://192.168.1.92:1234/v1/chat/completions"
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
    "Các type có thể là: 'calendar' (hỏi về lịch phòng, lịch thực hành, lịch dạy, môn học), 'booking' (hỏi về các yêu cầu đặt phòng, mượn phòng, yêu cầu cần xử lý, phiếu yêu cầu), 'other' (các trường hợp còn lại). "
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

# Cache helper functions
def get_cache_key(api_endpoint, access_token):
    """Tạo cache key từ API endpoint và token"""
    token_hash = hashlib.md5(access_token.encode()).hexdigest()[:8]
    return f"api:{api_endpoint.split('/')[-1]}:{token_hash}"

def get_from_cache(cache_key):
    """Lấy data từ cache"""
    if not redis_client:
        return None
    try:
        cached = redis_client.get(cache_key)
        if cached:
            print(f"[LOG] Cache hit: {cache_key}")
            return json.loads(cached)
    except Exception as e:
        print(f"[LOG] Cache get error: {e}")
    return None

def set_cache(cache_key, data, ttl_seconds=3600):
    """Lưu data vào cache với TTL"""
    if not redis_client:
        return
    try:
        redis_client.setex(cache_key, ttl_seconds, json.dumps(data, ensure_ascii=False))
        print(f"[LOG] Cache set: {cache_key} (TTL: {ttl_seconds}s)")
    except Exception as e:
        print(f"[LOG] Cache set error: {e}")

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
def clean_calendar_data(calendar_data, filter_today=False):
    weekday_map = {
        "2": "Thứ 2",
        "3": "Thứ 3",
        "4": "Thứ 4",
        "5": "Thứ 5",
        "6": "Thứ 6",
        "7": "Thứ 7",
        "8": "Chủ nhật"
    }
    
    # Lấy ngày hôm nay ở Việt Nam
    if filter_today:
        vn_tz = pytz.timezone('Asia/Ho_Chi_Minh')
        today = datetime.now(vn_tz).strftime('%d-%m-%Y')
    
    cleaned = []
    for item in calendar_data:
        item_date = item.get("date", "")
        
        # Nếu filter_today=True, chỉ lấy dữ liệu hôm nay
        if filter_today and item_date != today:
            continue
            
        cleaned.append({
            "Môn học": item.get("nameSubject", ""),
            "Giáo viên": item.get("nameTeacher", ""),
            "Phòng": item.get("nameRoom", ""),
            "Ngày": item_date,
            "Thứ": weekday_map.get(str(item.get("day", "")), item.get("day", "")),
            "Trạng thái": item.get("statusCalendar", "")
        })
    return cleaned

# Hàm làm sạch dữ liệu yêu cầu đặt phòng
def clean_booking_data(booking_data, filter_today=False):
    # Lấy ngày hôm nay ở Việt Nam
    if filter_today:
        vn_tz = pytz.timezone('Asia/Ho_Chi_Minh')
        today = datetime.now(vn_tz).strftime('%d-%m-%Y')
    
    cleaned = []
    for item in booking_data:
        date_request = item.get("dateRequest", "")
        
        # Nếu filter_today=True, chỉ lấy yêu cầu hôm nay
        if filter_today and date_request:
            # Lấy phần ngày từ dateRequest (format: "dd-mm-yyyy hh:mm:ss")
            try:
                request_date = date_request.split(' ')[0]  # Lấy phần ngày
                if request_date != today:
                    continue
            except:
                continue
                
        cleaned.append({
            "ID yêu cầu": item.get("requestId", ""),
            "Loại yêu cầu": item.get("typeRequestName", ""),
            "Ngày yêu cầu": date_request,
            "Người yêu cầu": item.get("userRequest", ""),
            "Trạng thái": item.get("statusName", "")
        })
    return cleaned

# Generator để stream response từ LLM về FE
def stream_llm_response(payload):
    with requests.post(LLM_ENDPOINT, json=payload, stream=True) as r:
        r.raise_for_status()
        for line in r.iter_lines():
            if line:
                line_str = line.decode('utf-8')
                try:
                    # Check if line starts with "data: " (Server-Sent Events format)
                    if line_str.startswith('data: '):
                        json_str = line_str[6:]  # Remove "data: " prefix
                        if json_str.strip() == '[DONE]':  # End of stream marker
                            break
                        data = json.loads(json_str)
                    else:
                        # Direct JSON format
                        data = json.loads(line_str)
                    
                    # Extract content from response
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

    # Step 2: Xử lý theo intent type
    if intent_type == "calendar":
        if not access_token:
            print("[LOG] Missing accessToken for calendar query")
            return jsonify({"error": "Missing accessToken for calendar query"}), 400
        try:
            # Kiểm tra cache trước
            cache_key = get_cache_key(CALENDAR_API, access_token)
            cached_data = get_from_cache(cache_key)
            
            if cached_data:
                cleaned_data = cached_data
            else:
                headers = {
                    "Authorization": f"Bearer {access_token}",
                    "Accept": "application/json"
                }
                calendar_response = requests.get(CALENDAR_API, headers=headers)
                calendar_response.raise_for_status()
                calendar_json = calendar_response.json()
                calendar_data = calendar_json.get("data", [])
                cleaned_data = clean_calendar_data(calendar_data)
                
                # Lưu vào cache với TTL 1 tiếng
                set_cache(cache_key, cleaned_data, 3600)
                
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
    
    elif intent_type == "booking":
        if not access_token:
            print("[LOG] Missing accessToken for booking query")
            return jsonify({"error": "Missing accessToken for booking query"}), 400
        try:
            # Kiểm tra cache trước
            cache_key = get_cache_key(BOOKING_API, access_token)
            cached_data = get_from_cache(cache_key)
            
            if cached_data:
                cleaned_booking_data = cached_data
            else:
                headers = {
                    "Authorization": f"Bearer {access_token}",
                    "Accept": "application/json"
                }
                booking_response = requests.get(BOOKING_API, headers=headers)
                booking_response.raise_for_status()
                booking_json = booking_response.json()
                booking_data = booking_json.get("data", [])
                cleaned_booking_data = clean_booking_data(booking_data)
                
                # Lưu vào cache với TTL 1 tiếng
                set_cache(cache_key, cleaned_booking_data, 3600)
                
            print(f"[LOG] Cleaned booking data: {cleaned_booking_data}")
        except Exception as e:
            print(f"[LOG] Failed to get booking data: {str(e)}")
            return jsonify({"error": f"Failed to get booking data: {str(e)}"}), 500
        
        # Lấy ngày và thứ hiện tại ở Việt Nam
        vn_tz = pytz.timezone('Asia/Ho_Chi_Minh')
        now = datetime.now(vn_tz)
        today_str = now.strftime('%d-%m-%Y')
        weekday_str = WEEKDAY_MAP[now.weekday()]
        
        # Tạo prompt cho booking
        booking_context = f"Ngày hiện tại ở Việt Nam: {today_str}\nThứ hiện tại ở Việt Nam: {weekday_str}\nDữ liệu yêu cầu đặt phòng: {json.dumps(cleaned_booking_data, ensure_ascii=False)}\n\n"
        answer_prompt = booking_context + prompt + "\n/no_thinking"
        print(f"[LOG] Booking prompt gửi tới AI: {answer_prompt}")
        
        answer_messages = [
            {"role": "system", "content": "Bạn là trợ lý quản lý yêu cầu đặt phòng. Hãy trả lời dựa trên dữ liệu yêu cầu bên dưới. Trả lời một cách đầy đủ thông tin và tổng quan bám sát vào câu hỏi người dùng đặt ra nhé"},
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

@app.route('/welcome', methods=['POST'])
def welcome():
    """Auto welcome message khi login thành công"""
    user_role = request.json.get("userRole")  # GV, GVU, CSVC, TK
    access_token = request.args.get("accessToken")
    
    if not user_role or not access_token:
        return jsonify({"error": "Missing userRole or accessToken"}), 400
    
    try:
        if user_role in ['GVU', 'CSVC', 'TK']:  # Roles cần xem yêu cầu
            # Kiểm tra cache trước (cache riêng cho today data)
            cache_key = get_cache_key(BOOKING_API, access_token)
            today_cache_key = cache_key + ":today"
            cached_data = get_from_cache(today_cache_key)
            
            if cached_data:
                cleaned_data = cached_data
            else:
                # Gọi API request management
                headers = {
                    "Authorization": f"Bearer {access_token}",
                    "Accept": "application/json"
                }
                response = requests.get(BOOKING_API, headers=headers)
                response.raise_for_status()
                booking_json = response.json()
                booking_data = booking_json.get("data", [])
                cleaned_data = clean_booking_data(booking_data, filter_today=True)
                
                # Lưu vào cache với TTL 1 tiếng (cache riêng cho today data)
                today_cache_key = cache_key + ":today"
                set_cache(today_cache_key, cleaned_data, 3600)
                cleaned_data = cleaned_data  # Sử dụng dữ liệu hôm nay
            
            # Tạo welcome message cho management roles
            welcome_prompt = f"Dữ liệu yêu cầu đặt phòng HÔM NAY cần xử lý: {json.dumps(cleaned_data, ensure_ascii=False)}\n\nHãy tóm tắt các yêu cầu HÔM NAY đang chờ xử lý cho {user_role}. Nếu không có yêu cầu nào hôm nay thì thông báo không có việc cần làm hôm nay."
            
        elif user_role == 'GV':  # Giảng viên - xem lịch dạy
            # Kiểm tra cache trước (cache riêng cho today data)
            gv_calendar_api = "http://localhost:8080/calendar"
            cache_key = get_cache_key(gv_calendar_api, access_token)
            today_cache_key = cache_key + ":today"
            cached_data = get_from_cache(today_cache_key)
            
            if cached_data:
                cleaned_data = cached_data
            else:
                # Gọi API calendar
                headers = {
                    "Authorization": f"Bearer {access_token}",
                    "Accept": "application/json"
                }
                response = requests.get(gv_calendar_api, headers=headers)  # API cho GV
                response.raise_for_status()
                calendar_json = response.json()
                calendar_data = calendar_json.get("data", [])
                cleaned_data = clean_calendar_data(calendar_data, filter_today=True)
                
                # Lưu vào cache với TTL 1 tiếng (cache riêng cho today data)
                set_cache(today_cache_key, cleaned_data, 3600)
            
            # Tạo welcome message cho giảng viên
            welcome_prompt = f"Dữ liệu lịch dạy HÔM NAY: {json.dumps(cleaned_data, ensure_ascii=False)}\n\nHãy tóm tắt lịch dạy HÔM NAY cho giảng viên. Nếu không có lịch hôm nay thì thông báo hôm nay không có lịch dạy."
        
        else:
            return jsonify({"error": "Unknown role"}), 400
        
        # Lấy ngày và thứ hiện tại
        vn_tz = pytz.timezone('Asia/Ho_Chi_Minh')
        now = datetime.now(vn_tz)
        today_str = now.strftime('%d-%m-%Y')
        weekday_str = WEEKDAY_MAP[now.weekday()]
        
        context = f"Ngày hiện tại ở Việt Nam: {today_str}\nThứ hiện tại ở Việt Nam: {weekday_str}\n\n"
        full_prompt = context + welcome_prompt + "\n/no_thinking"
        
        messages = [
            {"role": "system", "content": "Bạn là trợ lý thông minh. Hãy chào mừng người dùng và tóm tắt công việc cần làm một cách ngắn gọn, thân thiện."},
            {"role": "user", "content": full_prompt}
        ]
        payload = {
            "model": "qwen3-4b",
            "messages": messages,
            "temperature": 0.7,
            "stream": True
        }
        return Response(stream_llm_response(payload), mimetype='text/plain')
        
    except Exception as e:
        print(f"[LOG] Welcome API error: {str(e)}")
        return jsonify({"error": f"Failed to generate welcome message: {str(e)}"}), 500

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5001 , debug=True)
