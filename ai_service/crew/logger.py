"""CrewAI-style system logger with rich agent telemetry"""

import sys
import time


class SystemLogger:
    """
    CrewAI-inspired premium logging with rich agent telemetry.
    Features: Working Agent headers, tool usage, thought indicators, colorful output.
    """

    RESET = '\033[0m'
    BOLD = '\033[1m'
    DIM = '\033[2m'
    ITALIC = '\033[3m'
    UNDERLINE = '\033[4m'

    BLACK = '\033[30m'
    RED = '\033[91m'
    GREEN = '\033[92m'
    YELLOW = '\033[93m'
    BLUE = '\033[94m'
    MAGENTA = '\033[95m'
    CYAN = '\033[96m'
    WHITE = '\033[97m'

    BG_GREEN = '\033[42m'
    BG_BLUE = '\033[44m'
    BG_MAGENTA = '\033[45m'
    BG_CYAN = '\033[46m'

    AGENTS = {
        "ResumeParser": {
            "icon": "\U0001f4c4",
            "role": "Senior Resume Parser",
            "goal": "Extract and structure resume content with precision"
        },
        "ATSEngine": {
            "icon": "\U0001f3af",
            "role": "ATS Optimization Specialist",
            "goal": "Maximize ATS compatibility score through keyword optimization"
        },
        "SkillAnalyzer": {
            "icon": "\U0001f50d",
            "role": "Technical Skills Analyst",
            "goal": "Identify skill gaps and market alignment opportunities"
        },
        "CourseBuilder": {
            "icon": "\U0001f4da",
            "role": "Career Development Strategist",
            "goal": "Build personalized learning roadmaps for career growth"
        },
        "ResumeEnhancer": {
            "icon": "\u2728",
            "role": "Professional Resume Writer",
            "goal": "Transform bullet points into impactful achievement statements"
        },
        "PortfolioEnhancer": {
            "icon": "\U0001f310",
            "role": "Portfolio Content Strategist",
            "goal": "Transform resume content into engaging web portfolio copy"
        }
    }

    _start_time = None

    @staticmethod
    def crew_banner():
        print("", flush=True)
        print(f"{SystemLogger.BOLD}{SystemLogger.CYAN}", flush=True)
        print("  \u2554\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2557", flush=True)
        print("  \u2551                                                              \u2551", flush=True)
        print("  \u2551   \U0001f680  AI CAREER CREW  -  Multi-Agent Resume Analysis         \u2551", flush=True)
        print("  \u2551                                                              \u2551", flush=True)
        print("  \u255a\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u255d", flush=True)
        print(f"{SystemLogger.RESET}", flush=True)

    @staticmethod
    def crew_ready():
        print(f"\n{SystemLogger.GREEN}{SystemLogger.BOLD}\u2705 Crew assembled and ready for tasks{SystemLogger.RESET}\n", flush=True)

    @staticmethod
    def working_agent(agent_name: str, task_description: str):
        agent = SystemLogger.AGENTS.get(agent_name, {"icon": "\U0001f916", "role": "AI Agent", "goal": "Process data"})
        icon = agent["icon"]
        role = agent["role"]

        print("", flush=True)
        print(f"{SystemLogger.BOLD}{SystemLogger.MAGENTA}{'\u2500' * 70}{SystemLogger.RESET}", flush=True)
        print(f"{SystemLogger.BOLD}{SystemLogger.MAGENTA} {icon} Working Agent: {role}{SystemLogger.RESET}", flush=True)
        print(f"{SystemLogger.MAGENTA}{'\u2500' * 70}{SystemLogger.RESET}", flush=True)
        print(f"{SystemLogger.DIM}    Starting Task: {task_description}{SystemLogger.RESET}", flush=True)
        SystemLogger._start_time = time.time()

    @staticmethod
    def agent_thinking(thought: str):
        print(f"{SystemLogger.CYAN}    \U0001f9e0 Thinking: {thought}{SystemLogger.RESET}", flush=True)

    @staticmethod
    def agent_action(action: str):
        print(f"{SystemLogger.BLUE}    \u26a1 Action: {action}{SystemLogger.RESET}", flush=True)

    @staticmethod
    def using_tool(tool_name: str, input_summary: str = ""):
        print(f"{SystemLogger.YELLOW}    \U0001f527 Using Tool: {tool_name}{SystemLogger.RESET}", flush=True)
        if input_summary:
            print(f"{SystemLogger.DIM}       \u2514\u2500 Input: {input_summary}{SystemLogger.RESET}", flush=True)

    @staticmethod
    def tool_output(output_summary: str):
        print(f"{SystemLogger.GREEN}       \u2514\u2500 Output: {output_summary}{SystemLogger.RESET}", flush=True)

    @staticmethod
    def agent_observation(observation: str):
        print(f"{SystemLogger.CYAN}    \U0001f441\u200d\U0001f5e8 Observation: {observation}{SystemLogger.RESET}", flush=True)

    @staticmethod
    def agent_complete(result_summary: str):
        elapsed = ""
        if SystemLogger._start_time:
            elapsed = f" ({time.time() - SystemLogger._start_time:.2f}s)"
        print(f"{SystemLogger.GREEN}{SystemLogger.BOLD}    \u2705 Task Complete{elapsed}{SystemLogger.RESET}", flush=True)
        print(f"{SystemLogger.GREEN}       \u2514\u2500 Result: {result_summary}{SystemLogger.RESET}", flush=True)

    @staticmethod
    def delegating(from_agent: str, to_agent: str, reason: str):
        print(f"\n{SystemLogger.YELLOW}    \U0001f504 Delegating to {to_agent}: {reason}{SystemLogger.RESET}", flush=True)

    @staticmethod
    def crew_output(title: str, items: dict):
        print(f"\n{SystemLogger.BOLD}{SystemLogger.GREEN}{'\u2550' * 70}{SystemLogger.RESET}", flush=True)
        print(f"{SystemLogger.BOLD}{SystemLogger.GREEN}  \U0001f4ca {title}{SystemLogger.RESET}", flush=True)
        print(f"{SystemLogger.GREEN}{'\u2550' * 70}{SystemLogger.RESET}", flush=True)
        for key, value in items.items():
            print(f"  {SystemLogger.WHITE}\u2022 {key}: {SystemLogger.CYAN}{value}{SystemLogger.RESET}", flush=True)
        print(f"{SystemLogger.GREEN}{'\u2550' * 70}{SystemLogger.RESET}\n", flush=True)

    @staticmethod
    def crew_finished(total_time: float, summary: dict):
        print("", flush=True)
        print(f"{SystemLogger.BOLD}{SystemLogger.GREEN}\u2554\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2557{SystemLogger.RESET}", flush=True)
        print(f"{SystemLogger.BOLD}{SystemLogger.GREEN}\u2551                    \U0001f389 CREW EXECUTION COMPLETE                    \u2551{SystemLogger.RESET}", flush=True)
        print(f"{SystemLogger.BOLD}{SystemLogger.GREEN}\u255a\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u255d{SystemLogger.RESET}", flush=True)
        print(f"{SystemLogger.WHITE}  \u23f1\ufe0f  Total Time: {total_time:.2f}s{SystemLogger.RESET}", flush=True)
        print("", flush=True)
        for key, value in summary.items():
            print(f"  {SystemLogger.CYAN}\u2713 {key}: {SystemLogger.WHITE}{value}{SystemLogger.RESET}", flush=True)
        print("", flush=True)

    @staticmethod
    def info(component: str, message: str):
        print(f"{SystemLogger.CYAN}[INFO] [{component}] {message}{SystemLogger.RESET}", flush=True)

    @staticmethod
    def init(component: str, message: str):
        print(f"{SystemLogger.MAGENTA}[INIT] [{component}] {message}{SystemLogger.RESET}", flush=True)

    @staticmethod
    def run(component: str, message: str):
        print(f"{SystemLogger.BLUE}[RUN ] [{component}] {message}{SystemLogger.RESET}", flush=True)

    @staticmethod
    def done(component: str, message: str):
        print(f"{SystemLogger.GREEN}[DONE] [{component}] {message}{SystemLogger.RESET}", flush=True)

    @staticmethod
    def ok(component: str, message: str):
        print(f"{SystemLogger.GREEN}[OK  ] [{component}] {message}{SystemLogger.RESET}", flush=True)

    @staticmethod
    def warn(component: str, message: str):
        print(f"{SystemLogger.YELLOW}[WARN] [{component}] {message}{SystemLogger.RESET}", flush=True)

    @staticmethod
    def error(component: str, message: str):
        print(f"{SystemLogger.RED}[ERROR] [{component}] {message}{SystemLogger.RESET}", flush=True)

    @staticmethod
    def divider():
        print(f"{SystemLogger.DIM}{'-' * 44}{SystemLogger.RESET}", flush=True)

    @staticmethod
    def boot_header():
        print("", flush=True)
        SystemLogger.divider()
        print(f"{SystemLogger.MAGENTA}{SystemLogger.BOLD}[*] AI CAREER ENGINE STARTED{SystemLogger.RESET}", flush=True)
        SystemLogger.divider()

    @staticmethod
    def ready_footer():
        SystemLogger.divider()
        print(f"{SystemLogger.GREEN}{SystemLogger.BOLD}[+] System Ready -- Awaiting Requests{SystemLogger.RESET}", flush=True)
        SystemLogger.divider()
        print("", flush=True)

    @staticmethod
    def step_start(step_num: int, agent_name: str):
        print("", flush=True)
        SystemLogger.divider()
        print(f"{SystemLogger.BOLD}{SystemLogger.CYAN}[STEP {step_num}] {agent_name}{SystemLogger.RESET}", flush=True)
        SystemLogger.divider()

    @staticmethod
    def step_input(items: list):
        print(f"{SystemLogger.YELLOW}\u25b6 Input Received:{SystemLogger.RESET}", flush=True)
        for item in items:
            print(f"  {SystemLogger.DIM}- {item}{SystemLogger.RESET}", flush=True)

    @staticmethod
    def step_processing(items: list):
        print(f"{SystemLogger.BLUE}\u25b6 Processing:{SystemLogger.RESET}", flush=True)
        for item in items:
            print(f"  {SystemLogger.DIM}- {item}{SystemLogger.RESET}", flush=True)

    @staticmethod
    def step_output(items: list):
        print(f"{SystemLogger.GREEN}\u25b6 Output Generated:{SystemLogger.RESET}", flush=True)
        for item in items:
            print(f"  {SystemLogger.DIM}- {item}{SystemLogger.RESET}", flush=True)

    @staticmethod
    def step_status(status: str):
        if status == "SUCCESS":
            color = SystemLogger.GREEN
            emoji = "\u2705"
        elif status == "WARNING":
            color = SystemLogger.YELLOW
            emoji = "\u26a0\ufe0f"
        else:
            color = SystemLogger.RED
            emoji = "\u274c"
        print(f"{color}\u25b6 Status: {emoji} {status}{SystemLogger.RESET}", flush=True)

    @staticmethod
    def process_complete(summary_items: list):
        print("", flush=True)
        SystemLogger.divider()
        print(f"{SystemLogger.GREEN}{SystemLogger.BOLD}\u2705 PROCESS COMPLETED SUCCESSFULLY{SystemLogger.RESET}", flush=True)
        SystemLogger.divider()
        for item in summary_items:
            print(f"  \u2022 {item}", flush=True)
        SystemLogger.divider()
        print("", flush=True)
