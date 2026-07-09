from pathlib import Path

from PIL import Image, ImageDraw, ImageFont


BRAND_NAME = "KenEasy BiliCC Exporter"
BRAND_SUBTITLE = "Bilibili / B站 CC subtitles to TXT / SRT"
ZH_SUBTITLE = "B站 CC 字幕导出工具"
VERSION = "v1.0.4"

ROOT = Path(__file__).resolve().parents[1]
ASSETS = ROOT / "assets"
ICON = ROOT / "chrome-extension" / "icons" / "icon128.png"

BG = "#101114"
PANEL = "#181b21"
PANEL_2 = "#20242c"
BORDER = "#303641"
TEXT = "#f4f7fb"
MUTED = "#9aa4b2"
PINK = "#fb7299"
PINK_2 = "#ff4f7e"
BLUE = "#00aeec"
SUCCESS = "#27c499"


def font(size, bold=False):
    candidates = [
        "C:/Windows/Fonts/msyhbd.ttc" if bold else "C:/Windows/Fonts/msyh.ttc",
        "C:/Windows/Fonts/seguisb.ttf" if bold else "C:/Windows/Fonts/segoeui.ttf",
        "C:/Windows/Fonts/arialbd.ttf" if bold else "C:/Windows/Fonts/arial.ttf",
    ]
    for candidate in candidates:
        if candidate and Path(candidate).exists():
            return ImageFont.truetype(candidate, size)
    return ImageFont.load_default()


def text_size(draw, text, fnt):
    box = draw.textbbox((0, 0), text, font=fnt)
    return box[2] - box[0], box[3] - box[1]


def fit_font(draw, text, max_width, start_size, min_size=12, bold=False):
    for size in range(start_size, min_size - 1, -1):
        fnt = font(size, bold)
        if text_size(draw, text, fnt)[0] <= max_width:
            return fnt
    return font(min_size, bold)


def round_rect(draw, box, radius, fill, outline=None, width=1):
    draw.rounded_rectangle(box, radius=radius, fill=fill, outline=outline, width=width)


def paste_icon(canvas, box, radius=20):
    icon = Image.open(ICON).convert("RGBA").resize((box[2] - box[0], box[3] - box[1]))
    mask = Image.new("L", icon.size, 0)
    ImageDraw.Draw(mask).rounded_rectangle((0, 0, icon.width, icon.height), radius=radius, fill=255)
    canvas.paste(icon, box[:2], mask)


def gradient(width, height, left, right):
    image = Image.new("RGB", (width, height), left)
    draw = ImageDraw.Draw(image)
    l = tuple(int(left[i:i + 2], 16) for i in (1, 3, 5))
    r = tuple(int(right[i:i + 2], 16) for i in (1, 3, 5))
    for x in range(width):
        ratio = x / max(1, width - 1)
        color = tuple(int(l[i] + (r[i] - l[i]) * ratio) for i in range(3))
        draw.line((x, 0, x, height), fill=color)
    return image


def draw_button(draw, box, label, fill, outline=None):
    round_rect(draw, box, 10, fill, outline or fill)
    fnt = font(32, bold=True)
    w, h = text_size(draw, label, fnt)
    x = box[0] + (box[2] - box[0] - w) // 2
    y = box[1] + (box[3] - box[1] - h) // 2 - 3
    draw.text((x, y), label, font=fnt, fill="#ffffff")


def generate_github_preview():
    canvas = Image.new("RGB", (1280, 640), BG)
    draw = ImageDraw.Draw(canvas)
    card = (70, 70, 1210, 570)
    round_rect(draw, card, 28, "#15181e", BORDER, 1)
    round_rect(draw, (118, 142, 334, 357), 32, "#202632")
    paste_icon(canvas, (146, 170, 306, 329), 28)

    title_font = fit_font(draw, BRAND_NAME, 720, 68, 42, bold=False)
    draw.text((394, 171), BRAND_NAME, font=title_font, fill=TEXT)
    draw.text((394, 276), BRAND_SUBTITLE, font=font(34), fill="#b7c0cf")
    draw_button(draw, (394, 360, 562, 413), "TXT", PINK)
    draw_button(draw, (590, 360, 757, 413), "SRT", BLUE)

    ASSETS.mkdir(exist_ok=True)
    canvas.save(ASSETS / "github-preview.png", optimize=True)


def draw_popup_base(size=(720, 520), state="results", progress=0):
    image = Image.new("RGB", size, BG)
    draw = ImageDraw.Draw(image)
    width, height = size

    draw.rectangle((0, 0, width, 92), fill="#15171d")
    paste_icon(image, (28, 18, 84, 74), 12)
    title_font = fit_font(draw, BRAND_NAME, width - 128, 30, 18, bold=True)
    draw.text((100, 22), BRAND_NAME, font=title_font, fill=TEXT)
    draw.text((100, 58), ZH_SUBTITLE, font=font(14), fill=MUTED)
    draw.line((0, 92, width, 92), fill=BORDER, width=1)

    if state == "ready":
        round_rect(draw, (32, 120, width - 32, 224), 8, PANEL, BORDER)
        sample_title = "Sample video: Bilibili CC subtitle export demo"
        draw.text((56, 148), sample_title, font=fit_font(draw, sample_title, width - 112, 20, 13), fill=TEXT)
        round_rect(draw, (56, 184, 184, 213), 7, "#211722", PINK)
        draw.text((72, 189), "BV1xx411c7mD", font=font(14), fill=PINK)
        round_rect(draw, (194, 184, 268, 213), 7, PANEL_2, BORDER)
        draw.text((214, 189), "12:34", font=font(14), fill=MUTED)
        draw_button(draw, (32, 252, width - 32, 310), "Extract subtitles", PINK_2)

    elif state == "extracting":
        round_rect(draw, (32, 120, width - 32, 390), 8, PANEL, BORDER)
        draw.text((56, 150), "Preparing subtitle extraction", font=font(21, True), fill=TEXT)
        draw.rounded_rectangle((56, 204, width - 56, 214), radius=5, fill=BORDER)
        bar_width = int((width - 112) * progress)
        if bar_width:
            bar = gradient(max(1, bar_width), 10, PINK, BLUE)
            image.paste(bar, (56, 204))
        draw.text((56, 232), f"Fetching subtitle tracks ({int(progress * 100)}%)", font=font(15), fill=MUTED)
        steps = [
            ("Video information loaded", SUCCESS),
            ("Fetching subtitle tracks", TEXT if progress < 0.8 else SUCCESS),
            ("Subtitles are ready", MUTED if progress < 0.95 else SUCCESS),
        ]
        y = 274
        for label, color in steps:
            draw.ellipse((58, y + 5, 68, y + 15), fill=color if color != MUTED else BORDER)
            draw.text((82, y), label, font=font(15), fill=color)
            y += 34

    else:
        round_rect(draw, (32, 120, width - 32, 224), 8, PANEL, BORDER)
        sample_title = "Sample video: Bilibili CC subtitle export demo"
        draw.text((56, 148), sample_title, font=fit_font(draw, sample_title, width - 112, 20, 13), fill=TEXT)
        round_rect(draw, (56, 184, 184, 213), 7, "#211722", PINK)
        draw.text((72, 189), "BV1xx411c7mD", font=font(14), fill=PINK)
        round_rect(draw, (194, 184, 268, 213), 7, PANEL_2, BORDER)
        draw.text((214, 189), "12:34", font=font(14), fill=MUTED)

        tracks = [("Chinese auto-generated", "128 subtitles"), ("English", "126 subtitles")]
        y = 252
        for name, count in tracks:
            round_rect(draw, (32, y, width - 32, y + 76), 8, PANEL_2, BORDER)
            draw.text((56, y + 18), name, font=font(20), fill=TEXT)
            draw.text((56, y + 46), count, font=font(15), fill=MUTED)
            round_rect(draw, (520, y + 22, 586, y + 58), 8, "#18151c", PINK)
            draw.text((536, y + 29), "TXT", font=font(16), fill=PINK)
            round_rect(draw, (602, y + 22, 668, y + 58), 8, "#15171d", BORDER)
            draw.text((619, y + 29), "SRT", font=font(16), fill=TEXT)
            y += 92

        round_rect(draw, (32, 436, width - 32, 497), 8, PANEL, BORDER)
        draw.text((56, 453), "Preview: choose TXT or SRT to save the selected track", font=font(16), fill=MUTED)

    return image


def generate_popup_demo():
    draw_popup_base().save(ASSETS / "popup-demo.png", optimize=True)


def generate_popup_screenshot():
    image = Image.new("RGB", (390, 620), BG)
    draw = ImageDraw.Draw(image)
    draw.rectangle((0, 0, 390, 68), fill="#15171d")
    paste_icon(image, (18, 18, 50, 50), 7)
    title_font = fit_font(draw, BRAND_NAME, 300, 19, 13, bold=True)
    draw.text((60, 15), BRAND_NAME, font=title_font, fill=TEXT)
    draw.text((60, 40), ZH_SUBTITLE, font=font(11), fill="#a9c8ff")
    draw.line((0, 67, 390, 67), fill=BORDER)

    bv_font = font(33, True)
    w, _ = text_size(draw, "BV", bv_font)
    draw.text(((390 - w) // 2, 110), "BV", font=bv_font, fill=TEXT)
    message = "请打开 bilibili.com 的视频页面后再使用\nKenEasy BiliCC Exporter。"
    lines = message.splitlines()
    y = 156
    for line in lines:
        fnt = fit_font(draw, line, 340, 14, 11)
        lw, _ = text_size(draw, line, fnt)
        draw.text(((390 - lw) // 2, y), line, font=fnt, fill="#c5d0df")
        y += 24

    draw.rectangle((0, 207, 390, 241), fill="#15171d")
    draw.line((0, 207, 390, 207), fill=BORDER)
    draw.text((16, 219), f"{BRAND_NAME} {VERSION}", font=fit_font(draw, f"{BRAND_NAME} {VERSION}", 240, 11, 8), fill="#a9c8ff")
    draw.text((298, 219), "TXT / SRT", font=font(10), fill="#d3dcff")
    image.save(ASSETS / "popup-screenshot.png", optimize=True)


def generate_use_demo_gif():
    states = [
        ("ready", 0.0, 8),
        ("extracting", 0.25, 8),
        ("extracting", 0.55, 8),
        ("extracting", 0.88, 8),
        ("results", 1.0, 16),
    ]
    frames = []
    for state, progress, count in states:
        frame = draw_popup_base((489, 480), state=state, progress=progress).resize((489, 480), Image.Resampling.LANCZOS)
        frames.extend([frame] * count)
    frames[0].save(
        ASSETS / "use-demo.gif",
        save_all=True,
        append_images=frames[1:],
        duration=90,
        loop=0,
        optimize=True,
    )


def generate_use_demo_mp4():
    try:
        import cv2
        import numpy as np
    except Exception as error:
        print(f"Skipping MP4 generation: {error}")
        return

    sequence = [
        ("ready", 0.0, 15),
        ("extracting", 0.25, 15),
        ("extracting", 0.55, 15),
        ("extracting", 0.88, 15),
        ("results", 1.0, 45),
    ]
    size = (720, 520)
    writer = cv2.VideoWriter(
        str(ROOT / "UseDemo.mp4"),
        cv2.VideoWriter_fourcc(*"mp4v"),
        15,
        size,
    )
    if not writer.isOpened():
        print("Skipping MP4 generation: OpenCV VideoWriter could not open UseDemo.mp4")
        return

    for state, progress, count in sequence:
        frame = draw_popup_base(size, state=state, progress=progress)
        bgr = cv2.cvtColor(np.array(frame), cv2.COLOR_RGB2BGR)
        for _ in range(count):
            writer.write(bgr)
    writer.release()


def main():
    generate_github_preview()
    generate_popup_demo()
    generate_popup_screenshot()
    generate_use_demo_gif()
    generate_use_demo_mp4()


if __name__ == "__main__":
    main()
