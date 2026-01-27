import json
import time
import sys

def create_cast_file(filename):
    # Header
    events = []
    
    # Metadata
    header = {
        "version": 2,
        "width": 100,
        "height": 24,
        "timestamp": int(time.time()),
        "env": {"SHELL": "/bin/bash", "TERM": "xterm-256color"}
    }
    
    # Helper to add output event
    # Format: [time, type, data]
    # type "o" is stdout
    current_time = 0.0
    
    def type_command(cmd, speed=0.1):
        nonlocal current_time
        # Prompt
        events.append([current_time, "o", "\u001b[1;32muser@sagellm\u001b[0m:\u001b[1;34m~\u001b[0m$ "])
        current_time += 0.5
        
        for char in cmd:
            events.append([current_time, "o", char])
            current_time += speed
            
        events.append([current_time, "o", "\r\n"])
        current_time += 0.2

    def print_output(text, speed=0.0):
        nonlocal current_time
        if speed == 0:
            events.append([current_time, "o", text + "\r\n"])
            current_time += 0.05
        else:
            for char in text:
                events.append([current_time, "o", char])
                current_time += speed
            events.append([current_time, "o", "\r\n"])

    def stream_tokens(text, token_speed=0.02):
        nonlocal current_time
        # Simulate token generation (words or subwords)
        import re
        # Fix: terminal needs \r\n for new line, regular string has only \n
        text = text.replace('\n', '\r\n')
        tokens = re.split(r'(\s+)', text)
        for token in tokens:
            if not token: continue
            events.append([current_time, "o", token])
            current_time += token_speed

    # 1. Type the command
    type_command("sage-llm run --model deepseek-coder-33b --backend ascend")
    
    # 2. Output engine info
    print_output("\u001b[1m[SageLLM]\u001b[0m Initializing engine...", 0)
    current_time += 0.5
    print_output("\u001b[1m[SageLLM]\u001b[0m Engine: \u001b[32mascend\u001b[0m (NPU-910B)", 0)
    print_output("\u001b[1m[SageLLM]\u001b[0m Model: \u001b[36mdeepseek-coder-33b\u001b[0m", 0)
    print_output("\u001b[1m[SageLLM]\u001b[0m Backend: \u001b[33mHuawei Ascend 910B\u001b[0m", 0)
    current_time += 0.2
    
    # 3. Interactive Chat
    events.append([current_time, "o", "\r\nType 'exit' or press Ctrl-D to quit.\r\n"])
    current_time += 0.2
    
    # Prompt string
    prompt_str = "\u001b[1;36m>>> \u001b[0m"
    events.append([current_time, "o", prompt_str])
    current_time += 1.0
    
    # User types prompt
    user_prompt = "Write a Python function to calculate Fibonacci numbers recursively"
    for char in user_prompt:
        events.append([current_time, "o", char])
        current_time += 0.08 # Typing speed
    
    events.append([current_time, "o", "\r\n"])
    current_time += 0.5
    
    # 4. Streaming Output
    response_code = """Here is a Python function to calculate Fibonacci numbers recursively:

```python
def fibonacci(n):
    \"\"\"
    Calculate the nth Fibonacci number recursively.
    \"\"\"
    if n <= 0:
        return 0
    elif n == 1:
        return 1
    else:
        return fibonacci(n-1) + fibonacci(n-2)

# Example usage:
n = 10
result = fibonacci(n)
print(f"The {n}th Fibonacci number is {result}")
```

This function takes an integer `n` as input and returns the `n`th Fibonacci number. Note that recursive implementation can be slow for large `n` due to repeated calculations.
"""
    
    stream_tokens(response_code, 0.05) # Fast streaming
    
    # Done
    events.append([current_time, "o", "\r\n"])
    current_time += 0.2
    events.append([current_time, "o", prompt_str])
    current_time += 2.0
    
    # Exit
    events.append([current_time, "o", "exit\r\n"])
    current_time += 0.2
    events.append([current_time, "o", "Bye!\r\n"])
    
    
    # Write file
    with open(filename, 'w') as f:
        f.write(json.dumps(header) + "\n")
        for event in events:
            f.write(json.dumps(event) + "\n")

if __name__ == "__main__":
    create_cast_file(sys.argv[1] if len(sys.argv) > 1 else "demo.cast")
