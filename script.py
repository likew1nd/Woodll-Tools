from pathlib import Path
text = Path('src/tools/encoding-conversion/encoding-conversion.vue').read_text(encoding='utf-8')
start = text.index("      [\n        {\n          label: t('tools.encoding-conversion.gb2312ToUtf8'),")
end = text.index("      ],\n    ],\n  },\n  {", start)
print(repr(text[start:end]))
