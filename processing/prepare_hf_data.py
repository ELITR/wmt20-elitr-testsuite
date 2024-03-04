import collections
import json
import glob

markable_mapping = json.load(open("processing/line_mapping.json", "r"))
docs = list(markable_mapping.keys())
systems = list(json.load(open(f"collected_data/collected_data/p1/{docs[0]}-0.json", "r"))[docs[0]]["0"].keys())
systems.remove("time")
systems.remove("ref")

data_out = []
for doc in docs:
    doc_src = open(f"processing/doc_data/doc_data/{doc}/src.txt").read().strip().split("\n")
    doc_ref = open(f"processing/doc_data/doc_data/{doc}/ref.txt").read().strip().split("\n")
    assert len(doc_src) == len(doc_ref)

    markable_i_to_line = {}
    markable_line_to_index = {}
    for markable, markable_v in markable_mapping[doc].items():
        for index, line in markable_v.items():
            markable_i_to_line[(markable, index)] = line
            markable_line_to_index[(markable, line)] = index

    collected_p1 = {}
    for file in glob.glob(f"collected_data/collected_data/p1/{doc}-*.json"):
        uid = int(file.removeprefix(f"collected_data/collected_data/p1/{doc}-").removesuffix(".json"))
        collected_p1[uid] = json.load(open(file, "r"))[doc]

    collected_p2 = {}
    for file in glob.glob(f"collected_data/collected_data/p2/{doc}-*.json"):
        uid = int(file.removeprefix(f"collected_data/collected_data/p2/{doc}-").removesuffix(".json"))
        _data = json.load(open(file, "r"))
        _data = {
            k.removeprefix(doc+"-"):v
            for k,v in _data.items()
        }
        collected_p2[uid] = _data

    lines_systems = [{} for _ in doc_src]
    for sys in systems:
        doc_sys = open(f"processing/doc_data/doc_data/{doc}/{sys}.txt").read().strip().split("\n")
        assert len(doc_src) == len(doc_sys)
        for line_i, line in enumerate(doc_sys):
            lines_systems[line_i][sys] = {
                "translation": line,
                "annotation_p1": collections.defaultdict(dict),
                "annotation_p2": collections.defaultdict(dict),
            }
        # add P1 annotations
        for (markable, markable_index), markable_line in markable_i_to_line.items():
            for uid, uid_v in collected_p1.items():
                uid_v[markable_index][sys]["uid"] = f"user_{uid}"
                uid_v[markable_index][sys]["markable"] = markable
                lines_systems[markable_line][sys]["annotation_p1"][f"user_{uid}"] |= uid_v[markable_index][sys]

        # add P2 annotations
        for (markable, markable_index), markable_line in markable_i_to_line.items():
            for uid, uid_v in collected_p2.items():
                uid_v[markable][markable_index][sys]["uid"] = f"user_{uid}"
                uid_v[markable][markable_index][sys]["markable"] = markable
                lines_systems[markable_line][sys]["annotation_p2"][f"user_{uid}"] |= uid_v[markable][markable_index][sys]

    for line_src, line_ref, line_sys in zip(doc_src, doc_ref, lines_systems):
        data_out.append({
            "src": line_src,
            "ref": line_ref,
            "sys": line_sys
        })

json.dump(data_out, open("train.json", "w"), indent=2, ensure_ascii=False)