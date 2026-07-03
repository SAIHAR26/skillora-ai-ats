import json
import pathlib
import importlib.util
import traceback

output_path = pathlib.Path('temp_score_output.json')
error_path = pathlib.Path('temp_score_error.txt')

try:
    p = pathlib.Path('ml/predict.py')
    spec = importlib.util.spec_from_file_location('predict', p)
    mod = importlib.util.module_from_spec(spec)
    spec.loader.exec_module(mod)
    result = mod.score_resume({
        'resumeText': 'Experienced software engineer with 5 years in Python, React, and MongoDB. Built REST APIs and deployed Docker containers.'
    })
    output_path.write_text(json.dumps(result, ensure_ascii=False), encoding='utf-8')
except Exception:
    error_path.write_text(traceback.format_exc(), encoding='utf-8')
