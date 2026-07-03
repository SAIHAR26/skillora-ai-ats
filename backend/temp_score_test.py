import json
import pathlib
import importlib.util

p = pathlib.Path('ml/predict.py')
spec = importlib.util.spec_from_file_location('predict', p)
mod = importlib.util.module_from_spec(spec)
spec.loader.exec_module(mod)
result = mod.score_resume({
    'resumeText': 'Experienced software engineer with 5 years in Python, React, and MongoDB. Built REST APIs and deployed Docker containers.'
})
print(json.dumps(result, ensure_ascii=False))
