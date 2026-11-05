"""Builds preview.html: Play Store style preview slides using the app's own design tokens.
Render each slide with headless Chrome (see render.sh)."""
F = "../../node_modules/@expo-google-fonts"
css = '''
@font-face{font-family:Inter;font-weight:400;src:url(%(F)s/inter/400Regular/Inter_400Regular.ttf)}
@font-face{font-family:Inter;font-weight:500;src:url(%(F)s/inter/500Medium/Inter_500Medium.ttf)}
@font-face{font-family:Inter;font-weight:600;src:url(%(F)s/inter/600SemiBold/Inter_600SemiBold.ttf)}
@font-face{font-family:Inter;font-weight:700;src:url(%(F)s/inter/700Bold/Inter_700Bold.ttf)}
@font-face{font-family:Brico;font-weight:600;src:url(%(F)s/bricolage-grotesque/600SemiBold/BricolageGrotesque_600SemiBold.ttf)}
*{box-sizing:border-box;margin:0;padding:0}
body{width:1080px;height:1920px;overflow:hidden;font-family:Inter,sans-serif;color:#242424}
.slide{display:none;position:relative;width:1080px;height:1920px;overflow:hidden;background:linear-gradient(165deg,#f6effc 0%%,#fdeaf6 55%%,#eef0ff 100%%)}
.slide.on{display:block}
.slide:before{content:"";position:absolute;width:760px;height:760px;right:-260px;top:-240px;border-radius:50%%;background:radial-gradient(circle,rgba(154,105,201,.28),transparent 68%%)}
.slide:after{content:"";position:absolute;width:700px;height:700px;left:-300px;top:700px;border-radius:50%%;background:radial-gradient(circle,rgba(228,108,219,.2),transparent 68%%)}
.copy-block{position:absolute;top:110px;left:0;right:0;text-align:center;padding:0 70px;z-index:2}
.brand{display:inline-flex;align-items:center;gap:14px;font-weight:700;font-size:38px;letter-spacing:-1.5px;margin-bottom:46px}
h1{font-family:Brico;font-weight:600;font-size:112px;line-height:1.02;letter-spacing:-4px}
h1 em{font-style:normal;color:#9a69c9}
.sub{margin-top:30px;font-size:40px;line-height:1.35;color:#6f6f6f}
.device{position:absolute;left:50%%;top:640px;width:414px;padding:12px;border-radius:66px;background:#141414;transform:translateX(-50%%) scale(2.0);transform-origin:top center;box-shadow:0 0 0 2px #3a3a3a,0 30px 60px rgba(60,20,90,.35);z-index:3}
.screen{position:relative;width:390px;height:844px;border-radius:54px;overflow:hidden;background:#f4f4f4;display:flex;flex-direction:column}
.dark{background:#1b1d1c;color:#f2f2f1}
.status{height:44px;flex:none;display:flex;justify-content:space-between;align-items:center;padding:6px 28px 0;font-size:13px;font-weight:600}
.pad{padding:0 18px}
.hdr{display:flex;justify-content:space-between;align-items:center;padding:8px 18px 10px}
.logo{display:flex;align-items:center;gap:9px;font-weight:700;font-size:18px;letter-spacing:-1px}
.logo b{color:#9a69c9}
.rmark{width:31px;height:31px;border-radius:50%%;background:#242424;color:#fff;display:flex;align-items:center;justify-content:center;font-family:Brico;font-size:17px}
.rnd{width:36px;height:36px;border-radius:50%%;border:1px solid #ebebeb;background:#fff;display:flex;align-items:center;justify-content:center}
.dark .rnd{background:#282b29;border-color:#383b39}
.card{background:#fff;border:1px solid #ebebeb;border-radius:17px}
.dark .card{background:#282b29;border-color:#383b39}
.sub2{color:#888}.dark .sub2{color:#aaaead}
.kick{font-size:12px;font-weight:600;letter-spacing:1.2px;color:#888}
.pill{display:inline-flex;align-items:center;justify-content:center;height:38px;padding:0 14px;border:1px solid #ebebeb;border-radius:19px;background:#f9f9f9;font-size:14px;font-weight:500;gap:7px}
.dark .pill{background:#222523;border-color:#383b39}
.chip{padding:5px 10px;border-radius:8px;font-size:12px;font-weight:500}
.tl{display:flex;gap:12px}
.node{width:22px;display:flex;flex-direction:column;align-items:center}
.node i{width:22px;height:22px;margin-top:8px;border-radius:50%%;border:1px solid;display:flex;align-items:center;justify-content:center}
.node i s{width:8px;height:8px;border-radius:50%%}
.node u{flex:1;width:1.5px;margin-top:6px;background:#ebebeb}
.body{flex:1;min-width:0}
.row{min-height:38px;display:flex;align-items:center;justify-content:space-between}
.txt{font-size:15px;line-height:23px;margin-top:6px}
.dim{position:absolute;inset:0;background:rgba(0,0,0,.42)}
.sheet{position:absolute;left:0;right:0;bottom:0;background:#f4f4f4;border-radius:28px 28px 0 0;padding:9px 17px 30px}
.grab{width:38px;height:4px;border-radius:2px;background:#ebebeb;margin:0 auto 16px}
.sw{width:52px;height:32px;border-radius:16px;padding:3px;background:#ebebeb;display:flex;align-items:center}
.sw.on{background:#9a69c9;justify-content:flex-end}
.sw b{width:26px;height:26px;border-radius:50%%;background:#fff;box-shadow:0 1px 2px rgba(0,0,0,.2)}
.av{border-radius:50%%;display:inline-block;flex:none}
.composer{position:relative;margin:0 10px 10px;padding:13px 14px 12px;border:1px solid #ebebeb;border-radius:22px;background:#fff}
.ring{position:absolute;inset:-1px;border-radius:22px;padding:2.4px;background:linear-gradient(120deg,#9a69c9,#e46cdb,#f77db6,#7a85ee,#9a69c9);-webkit-mask:linear-gradient(#000 0 0) content-box,linear-gradient(#000 0 0);-webkit-mask-composite:xor;mask-composite:exclude}
.sendb{width:42px;height:42px;border-radius:50%%;background:#242424;display:flex;align-items:center;justify-content:center}
''' % {'F': F}

ICONS = {
    'copy': '<rect x="9" y="9" width="11" height="11" rx="2"/><path d="M5 15V6a2 2 0 0 1 2-2h8"/>',
    'sun': '<circle cx="12" cy="12" r="4"/><path d="M12 2v2M12 20v2M2 12h2M20 12h2M5 5l1.5 1.5M17.5 17.5 19 19M5 19l1.5-1.5M17.5 6.5 19 5"/>',
    'moon': '<path d="M20 14.5A8 8 0 1 1 9.5 4 6.5 6.5 0 0 0 20 14.5Z"/>',
    'plus': '<path d="M12 5v14M5 12h14"/>', 'chev': '<path d="m6 9 6 6 6-6"/>', 'right': '<path d="m9 6 6 6-6 6"/>',
    'up': '<path d="M12 19V5M5 12l7-7 7 7"/>', 'clock': '<circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/>',
}


def icon(name, size=16, color='currentColor'):
    return f'<svg width="{size}" height="{size}" viewBox="0 0 24 24" fill="none" stroke="{color}" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">{ICONS[name]}</svg>'


BG = {'clover': '#d9eee5', 'fork': '#e8e1fa', 'bloom': '#e0e5ff', 'petals': '#f9dcf5', 'asterisk': '#292a2b', 'quad': '#fce2f8', 'rays': '#f06adf', 'burst': '#ffe2d8'}
ART = {
    'fork': '<path d="M19 7h10v17l11 7-6 10-10-7-10 7-6-10 11-7V7Z" fill="#8069db"/>',
    'petals': '<g fill="#e46cdb">' + ''.join(f'<ellipse cx="24" cy="13" rx="8.5" ry="13" transform="rotate({a} 24 24)"/>' for a in (0, 90, 180, 270)) + '</g>',
    'clover': '<path d="M24 22C18 10 9 8 6 14c-3 6 2 11 13 10C8 25 3 32 8 39c5 6 13 3 16-9 3 12 11 15 16 9 5-7 0-14-11-15 11 1 16-4 13-10-3-6-12-4-18 8Z" fill="#1b6758"/>',
    'asterisk': '<g stroke="#fffdf4" stroke-width="4.2" stroke-linecap="round"><path d="M24 6v36M6 24h36M11 11l26 26M37 11 11 37"/></g>',
    'quad': '<g fill="#f083e8"><circle cx="15" cy="15" r="8.5"/><circle cx="33" cy="15" r="8.5"/><circle cx="15" cy="33" r="8.5"/><circle cx="33" cy="33" r="8.5"/></g>',
    'bloom': '<g fill="#697aeb"><circle cx="24" cy="24" r="16"/></g>',
    'rays': '<g fill="#241824">' + ''.join(f'<path d="M24 21 20.5 5h7L24 21Z" transform="rotate({i * 30} 24 24)"/>' for i in range(12)) + '</g>',
    'burst': '<circle cx="24" cy="24" r="15" fill="#ff4c28"/>',
}


def av(kind, size):
    return f'<svg class="av" width="{size}" height="{size}" viewBox="0 0 48 48"><circle cx="24" cy="24" r="24" fill="{BG[kind]}"/><g transform="translate(3.84 3.84) scale(.84)">{ART[kind]}</g></svg>'


def status():
    return '<div class="status"><span>9:41</span><span>5G ▮</span></div>'


def header(dark=False):
    return f'<div class="hdr"><div class="logo"><div class="rmark">r</div><span>rewrite<b>.</b></span></div><div style="display:flex;gap:10px"><div class="rnd">{icon("sun" if dark else "moon", 18)}</div><div class="rnd">{av("fork", 28)}</div></div></div>'


ACC = {'Better': '#9a69c9', 'Professional': '#4f7cd6', 'Casual': '#e0894a', 'Polite': '#3fa77f'}


def timeline(items, gap=26):
    out = ''
    for i, (title, text) in enumerate(items):
        a = ACC[title]
        last = i == len(items) - 1
        line = '' if last else '<u></u>'
        out += (f'<div class="tl"><div class="node"><i style="border-color:{a}55;background:{a}1f"><s style="background:{a}"></s></i>{line}</div>'
                f'<div class="body" style="padding-bottom:{0 if last else gap}px"><div class="row"><span class="chip" style="background:{a}22;color:{a}">{title}</span>'
                f'<span class="pill">{icon("copy", 18)}Copy</span></div><div class="txt">{text}</div></div></div>')
    return out


def composer(ring=False):
    ring_html = '<div class="ring"></div>' if ring else ''
    return (f'<div class="composer">{ring_html}<div style="display:flex;justify-content:space-between;align-items:center"><b style="font-size:14px;font-weight:500">Your message</b>'
            f'<div style="display:flex;gap:7px"><span class="pill">Paste</span><span class="pill" style="opacity:.45">Clear</span></div></div>'
            f'<div style="height:58px;padding-top:12px;font-size:15px;color:#a4a4a4">Type your message here...</div>'
            f'<div style="display:flex;justify-content:space-between;align-items:center"><div style="display:flex;gap:8px;align-items:center">'
            f'<div class="rnd" style="width:38px;height:38px;background:#f9f9f9">{icon("plus", 20)}</div>'
            f'<span class="pill" style="min-width:118px;justify-content:space-between;height:40px">English {icon("chev", 14)}</span></div>'
            f'<div class="sendb" style="opacity:.34">{icon("up", 18, "#fff")}</div></div></div>')


def slide(n, h, sub, screen, dark=False):
    cls = 'screen dark' if dark else 'screen'
    return (f'<section class="slide" data-n="{n}"><div class="copy-block"><div class="brand"><div class="rmark" style="width:54px;height:54px;font-size:30px">r</div><span>rewrite<span style="color:#9a69c9">.</span></span></div>'
            f'<h1>{h}</h1><p class="sub">{sub}</p></div><div class="device"><div class="{cls}">{status()}{screen}</div></div></section>')


DRAFT = 'wen can u send the file? i need it asap thnaks'
VERSIONS = [("Better", "When can you send the file? I need it as soon as possible. Thanks!"),
            ("Professional", "Could you please send the file at your earliest convenience? Thank you."),
            ("Casual", "Hey, can you send the file soon? Thanks!")]

login = f'''<div class="pad" style="flex:1;display:flex;flex-direction:column;align-items:center;padding-top:34px;text-align:center">
<div class="kick">YOUR WORDS, A LITTLE BETTER</div>
<div style="font-family:Brico;font-size:46px;line-height:50px;letter-spacing:-2px;margin-top:12px">Your message,<br>just better.</div>
<div class="sub2" style="font-size:15px;line-height:22px;max-width:320px;margin-top:14px">Paste a rough message. Get clearer English in one click, ready to copy and send.</div>
<div style="position:relative;width:310px;height:236px;margin-top:6px;transform:scale(.82);transform-origin:top center;margin-bottom:-40px">
<div style="position:absolute;left:12px;top:132px">{av("clover", 44)}</div><div style="position:absolute;left:237px;top:6px">{av("fork", 50)}</div><div style="position:absolute;left:256px;top:180px">{av("petals", 42)}</div>
<div class="card" style="position:absolute;top:26px;left:26px;width:205px;padding:17px 20px;text-align:left;transform:rotate(-3deg);border-radius:20px"><div style="font-size:9px;font-weight:700;letter-spacing:.9px;color:#a4a4a4">YOUR DRAFT</div><div class="sub2" style="font-size:12px;margin-top:10px;font-weight:500">wen can u send the file?</div></div>
<div style="position:absolute;z-index:3;top:96px;left:133px;width:43px;height:43px;border-radius:50%;border:4px solid #f4f4f4;background:#242424;display:flex;align-items:center;justify-content:center;color:#fff;font-family:Brico;font-size:18px">r</div>
<div class="card" style="position:absolute;top:120px;right:18px;width:205px;padding:17px 20px;text-align:left;transform:rotate(2deg);border-radius:20px"><div style="font-size:9px;font-weight:700;letter-spacing:.9px;color:#a4a4a4">BETTER VERSION</div><div style="font-size:12px;margin-top:10px;font-weight:500">When can you send the file?</div></div></div>
<div style="margin-top:6px;width:100%"><div style="height:52px;border-radius:26px;background:#242424;color:#fff;display:flex;align-items:center;justify-content:center;gap:10px;font-size:14px;font-weight:600"><span style="background:#fff;border-radius:50%;width:22px;height:22px;display:inline-flex;align-items:center;justify-content:center;color:#4285f4;font-weight:700;font-size:13px">G</span>Continue with Google</div><div class="sub2" style="font-size:11px;margin-top:13px">Secure sign-in with Google.</div><div class="sub2" style="font-size:12px;margin-top:20px;font-weight:500">Made for the moment before you hit send.</div></div></div>'''

opts = [('Better', 'Clear, natural, and grammatically correct', 1), ('Professional', 'Polished and appropriate for work', 1),
        ('Casual', 'Friendly, relaxed, and conversational', 0), ('Polite', 'Considerate, respectful, and warm', 0)]
rows = ''.join(
    f'<div style="min-height:78px;padding:10px 16px;display:flex;align-items:center;gap:13px;{"border-top:1px solid #ebebeb;" if i else ""}background:{"#f9f9f9" if on else "#fff"}">'
    f'<div style="flex:1"><div style="font-size:16px;font-weight:500">{t}</div><div class="sub2" style="font-size:14px;line-height:20px;margin-top:3px">{d}</div></div>'
    f'<div class="sw {"on" if on else ""}"><b></b></div></div>' for i, (t, d, on) in enumerate(opts))
versions = f'''{header()}<div style="flex:1;position:relative"><div style="padding:60px 28px;text-align:center;opacity:.6"><div class="rmark" style="width:64px;height:64px;font-size:34px;margin:0 auto">r</div><div style="font-family:Brico;font-size:22px;margin-top:18px">Start with a message</div></div>
<div class="dim"></div><div class="sheet"><div class="grab"></div><div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:12px"><div><div style="font-size:20px;font-weight:600;letter-spacing:-.4px">Choose your versions</div><div class="sub2" style="font-size:14px;margin-top:4px">Select one or more styles for your rewritten message.</div></div><span class="pill" style="background:#fff">Done</span></div><div class="card" style="overflow:hidden;margin-top:5px">{rows}</div></div></div>'''

results = f'''{header()}<div class="pad" style="flex:1;overflow:hidden"><div class="card" style="padding:12px 16px;display:flex;justify-content:space-between;align-items:center"><div><div class="kick">YOUR SPACE</div><div style="font-size:20px;font-weight:600;letter-spacing:-.4px">Recent rewrites</div></div><div style="display:flex;align-items:center;gap:8px">{av("fork", 24)}{icon("right", 18)}</div></div>
<div style="margin:22px 0 0 auto;max-width:86%;padding:12px 16px;border:1px solid #ebebeb;border-radius:20px 20px 6px 20px;background:#fff;font-size:16px;line-height:24px">{DRAFT}</div>
<div style="margin:22px 0 18px;font-size:17px;line-height:25px">Here are all 3 rewritten versions of your message</div>
{timeline(VERSIONS, 34)}</div>{composer(True)}'''


def small(kind, title, text):
    return (f'<div class="card" style="width:calc(50% - 7px);min-height:170px;padding:17px 15px 15px;display:flex;flex-direction:column">{av(kind, 42)}'
            f'<div style="margin-top:auto;padding-top:10px;font-size:15px;font-weight:500">{title}</div><div class="sub2" style="margin-top:6px;font-size:14px;line-height:20px">{text}</div>'
            f'<div style="margin-top:14px;font-size:12px;color:#a4a4a4">Nov 4</div></div>')


recent = f'''{header()}<div class="pad" style="flex:1;overflow:hidden"><div style="display:flex;justify-content:space-between;align-items:center;margin:8px 3px 14px"><div><div class="kick">YOUR SPACE</div><div style="font-size:22px;font-weight:600;letter-spacing:-.7px">Recent rewrites</div></div><div class="sub2" style="font-size:14px">6 saved</div></div>
<div class="card" style="min-height:210px;overflow:hidden;display:flex;flex-direction:column"><div style="padding:26px 25px 0"><div style="font-size:21px;font-weight:600;letter-spacing:-.5px">Latest message</div><div style="margin-top:8px;font-size:13px;font-weight:500">Nov 4</div><div class="sub2" style="margin-top:13px;font-size:15px;line-height:22px">When can you send the file? I need it as soon as possible. Thanks!</div></div><div style="margin-top:auto;padding:18px 23px 24px;background:#f9f9f9;display:flex;justify-content:space-between;align-items:center"><div style="display:flex;gap:7px;align-items:center;font-size:14px;font-weight:500">{icon("clock", 16)}Saved rewrite</div><div style="display:flex;gap:4px">{av("clover", 26)}{av("fork", 26)}{av("petals", 26)}</div></div></div>
<div style="display:flex;flex-wrap:wrap;gap:14px;margin-top:14px">{small("fork", "Rewrite 2", "Could you please review the draft by Friday?")}{small("petals", "Rewrite 3", "How about you? Last night you didn't feel well.")}{small("asterisk", "Rewrite 4", "Hey, I wanted to check if you had time to review this.")}{small("rays", "Rewrite 5", "I want to do that, but it is not possible for me.")}</div>
<div style="margin:17px 3px;font-size:13px;display:flex;gap:7px;align-items:center;color:#a4a4a4">{icon("clock", 16)}Rewrites are automatically deleted after 14 days.</div></div>'''

details = f'''<div style="flex:1;position:relative;overflow:hidden">{header()}<div class="pad" style="opacity:.5"><div class="card" style="height:180px"></div></div><div class="dim"></div>
<div class="sheet" style="top:70px;padding-bottom:20px"><div class="grab"></div><div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:6px"><div><div style="font-size:18px;font-weight:600;letter-spacing:-.4px">Rewrite details</div><div class="sub2" style="font-size:13px;margin-top:2px">Nov 4</div></div><span class="pill" style="background:#fff">Done</span></div>
<div style="padding-top:12px"><div class="row" style="margin-bottom:8px"><span class="sub2" style="font-size:12px;font-weight:500">Your message</span><span class="pill">{icon("copy", 18)}Copy</span></div><div class="card" style="padding:16px;border-radius:18px;font-size:14px;line-height:21px">{DRAFT}</div>
<div class="sub2" style="margin:26px 0 14px;font-size:12px;font-weight:500">3 rewritten versions</div>{timeline(VERSIONS, 26)}</div></div></div>'''

profile = f'''{header(True)}<div class="pad" style="flex:1;overflow:hidden"><div class="pill" style="margin:16px 0 24px">&larr; Workspace</div><div style="margin:0 3px 22px"><div class="kick">YOUR SPACE</div><div style="font-size:30px;font-weight:600;letter-spacing:-1.2px">Your profile</div><div class="sub2" style="margin-top:12px;font-size:16px">A simple home for your writing.</div></div>
<div class="card" style="overflow:hidden;border-radius:18px"><div style="padding:25px">{av("fork", 64)}<div style="margin-top:22px"><span style="padding:6px 8px;border-radius:6px;background:#222523;color:#aaaead;font-size:11px;font-weight:700;letter-spacing:.9px">GOOGLE ACCOUNT</span></div><div style="margin-top:14px;font-size:26px;font-weight:600;letter-spacing:-.8px">Alex Morgan</div><div class="sub2" style="margin-top:8px;font-size:15px">alex@example.com</div></div>
<div style="display:flex;border-top:1px solid #383b39;background:#222523"><div style="flex:1;padding:18px 25px"><div class="sub2" style="font-size:13px">Rewrites saved</div><div style="margin-top:10px;font-size:16px;font-weight:500">6</div></div><div style="flex:1;padding:18px 25px;border-left:1px solid #383b39"><div class="sub2" style="font-size:13px">Saved on</div><div style="margin-top:10px;font-size:16px;font-weight:500">This device</div></div></div>
<div style="padding:25px 25px 24px;border-top:1px solid #383b39"><div style="font-size:14px;font-weight:500;margin-bottom:15px">Choose your icon</div><div style="display:flex;gap:12px;flex-wrap:wrap">{av("clover", 42)}<span style="padding:2px;border:2px solid #a477d0;border-radius:50%;display:inline-flex">{av("fork", 42)}</span>{av("bloom", 42)}{av("petals", 42)}{av("asterisk", 42)}{av("rays", 42)}{av("burst", 42)}{av("quad", 42)}</div></div></div></div>'''

slides = [
    slide(1, "Your message,<br><em>just better.</em>", "Paste a rough draft. Get clear, natural English in one tap.", login),
    slide(2, "Pick the <em>tone</em> you need", "Better, Professional, Casual or Polite. Choose one or all.", versions),
    slide(3, "Every version, <em>ready to send</em>", "Watch your rewrites appear, then copy the one that fits.", results),
    slide(4, "Your rewrites, <em>saved</em>", "Recent messages stay on your device, one tap away.", recent),
    slide(5, "Reopen and <em>copy</em> anytime", "See your original and every version side by side.", details),
    slide(6, "Light, dark, and <em>yours</em>", "Switch themes and pick your own profile icon.", profile, True),
]
script = '<script>var n=new URLSearchParams(location.search).get("n")||"1";document.querySelector(\'[data-n="\'+n+\'"]\').classList.add("on")</script>'
html = f'<!doctype html><html><head><meta charset="utf-8"><style>{css}</style></head><body>{"".join(slides)}{script}</body></html>'
open('docs/store-preview/preview.html', 'w', encoding='utf-8').write(html)
