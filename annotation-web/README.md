# WMT20 Elitr Annotation Frontend

Built with TypeScript/Webpack frontend, Python/Flask backend.

## Building WMT20 Elitr Annotation Project

### 1 Build interface

After `git clone` and `npm install` run `npm run build`, which outputs the whole frontend to `interface/dist`.

### 2 Specify markables

Edit `processing/markables.yaml` so that it contains the list of markable codes and all the associated forms (used for source documents).

```
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

### Prepare src documents

TODO

### Load documents

TODO (Naming scheme)

## Develpoment

For development server (dev/debug purposes) run `npm run dev`. The server is then accessible locally and watches for source file changes.