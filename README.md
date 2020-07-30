# WMT20 Elitr Annotation Frontend

Built with TypeScript/Webpack frontend and Python/Flask backend and processing scripts.

## Development

### Interface

After `git clone` and `npm install` run `npm run build`, which outputs the whole frontend to `interface/dist`.

Furthermore you can run `npm run dev`, which starts a local http server and serves the current project and recompiles & reloads on any code change.

### Server

To run the server simply execute the `run.sh`. Make sure that the url and the port matches the one specified in the interface.

## Experiment preparation

To run the experiment, two files must be supplied: `content.json` and `queue_user.json`. These files are produced using provided scripts from an `experiment.yaml` file and a directory of documents. The `json` files need to be put in the `backend/logs` directory so that the server can use them. The output of this experiment is a file `backend/logs/rating_user.json` where the user ratings are stored.

The `experiment.yaml` file has four top-level components: `users`, `docs`, `mts` and `markables`. An example `experiment.yaml` file is provided in the `processing/` directory.

- `users` is a list of user ids
- `mts` is a list of machine translation submission models
- `docs` is a list of documents to be evaluated
- `markables` is a list of keys, which then map to a list of corresponding forms in the _source_ language

```
markables:
  uni:
    - university
    - univerzita
    - univerzit

  literature:
    - literature
    - literatura
    - literatury
    - literatuře
...
```

Assuming the relevant `experiment.yaml` file has been written and that the documents are stored in `example_docs` in the format of `DOCNAME_MTNAME.xml` you can run the following commands to generate experiment and copy it to the desctination.

```
processing/src/prepare_queue.py processing/experiment.yaml processing/example_docs/
processing/src/prepare_content.py processing/experiment.yaml processing/example_docs/
mv {content,queue_user}.json backend/logs/
```

## Data preparation

### Extraction

WMT .sgm to .txt was done using a script similar to this:

```
for file in ./*.sgm; do
	echo $file 
	tail -n +14973 "$file" | head -n 13 | sed -E 's/<seg id="[0-9]*">//g; s/<\/seg>//g' > tmp
	mv tmp "$file"
done
```

### Model renaming

#### PROMT_NMT - eTranslation

Since `PROMT_NMT` only does cs->en and `eTranslation` en->cs, the models were unified into one called `PROMT_NMT-eTranslation` so that it's easier to process. They should be separated in the evaluation.

#### Newstest online-[abc]

The `newstest2020 online` models were stripped of all the language codes so that in both directions only three models could be used: `newstest2020-online-[abc].sgm`.

### Data types

| Document | Direction | Lines | Markable Occurences | Description | Source |
|----------|-----------|-------|---------------------|-------------|--------|
| kufrc | cs->en | 29 | 73 | housing lease agreement | SMLprodl |
| kufre | en->cs | 29 | 70 | housing lease agreement | SMLprodl |
| autoc | cs->en | 18 | 11 | Brno Grand Prix article, highway accident report | denik.cz.201550+blesk.cz.189684 |
| euroe | en->cs | 13 | 15 | Greta Thunberg's U.N. speech article | rt.com.113881 |
| broukc | cs->en | 90 | 28 | Supreme Audit Office audit report | KA_13_04 |
| brouke | en->cs | 90 | 18 | Supreme Audit Office audit report | KA_13_04 |
| __Total__ | - | __269__ | __215__ | - | - |

### Miscellaneous commands

```
scp testsuite:wmt20-elitr-testsuite/backend/logs/p1/ratings/*.json ~/wmt20/data/p1/
scp testsuite:wmt20-elitr-testsuite/backend/logs/p2/ratings/*.json ~/wmt20/data/p2/
```