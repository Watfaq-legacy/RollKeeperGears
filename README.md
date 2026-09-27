# RollKeeperGears 📷

**RollKeeperGears** 是 [RollKeeper](https://github.com/Watfaq-legacy/RollKeeper) 桌面端原生摄影档案与元数据管理器的官方器材数据库存储仓库。

本仓库采用**模块化、分品牌**的文件结构进行维护，避免维护单一庞大的 JSON 文件，便于协作更新与版本溯源，并通过自动化脚本定期或在提交时编译为供桌面端下载同步的统一 `gears.json`。

---

## 目录结构

```text
RollKeeperGears/
├── data/
│   ├── cameras/          # 机身数据（按品牌分类，如 leica.json, nikon.json, sony.json 等）
│   ├── lenses/           # 镜头数据（如 voigtlander.json, leica.json, carl-zeiss.json 等）
│   ├── films/            # 胶卷数据（如 kodak.json, fujifilm.json, ilford.json 等）
│   └── developers/       # 显影配方与冲洗工艺（如 kodak.json, adox-agfa.json 等）
│
├── dist/
│   ├── gears.json        # 格式化完整数据库（供客户端下载同步）
│   └── gears.min.json    # 压缩版数据库（体积更小、网络传输更快）
│
├── scripts/
│   └── build.js          # 合并、去重、校验与构建发布脚本
│
├── .github/workflows/
│   └── build.yml         # GitHub Actions 自动化编译与校验工作流
└── package.json
```

---

## 如何添加或修改器材

所有的器材都保存在 `data/` 目录下的相应分类中：

### 1. 添加机身 (`data/cameras/<brand>.json`)
```json
{
  "id": "cam-brand-model",
  "brand": "品牌名",
  "model": "型号 (如: M6 Classic, FM2n)",
  "format": "画幅 (如: 135, 120 (6x6), Full Frame 35mm)",
  "cameraType": "类型 (Rangefinder / SLR / Point & Shoot / TLR / Large Format View / Mirrorless Digital)"
}
```

### 2. 添加镜头 (`data/lenses/<brand>.json`)
特别包含完整的**福伦达 (Voigtländer)** VM / LTM 等经典旁轴与单反镜头系列：
```json
{
  "id": "lens-voigtlander-35-nokton-ii",
  "brand": "Voigtländer",
  "model": "Nokton Classic 35mm f/1.4 II VM",
  "focalLength": "35mm",
  "maxAperture": "f/1.4",
  "mount": "Leica M (VM)"
}
```

### 3. 添加胶卷 (`data/films/<brand>.json`)
```json
{
  "id": "film-brand-name",
  "brand": "Kodak",
  "name": "Portra 400",
  "nominalIso": 400,
  "process": "C-41",
  "type": "Color Negative",
  "formats": ["135", "120", "4x5"]
}
```

### 4. 添加显影配方 (`data/developers/<brand>.json`)
```json
{
  "id": "dev-brand-name",
  "brand": "Kodak",
  "name": "D-76 (1:1 / Stock)",
  "process": "B&W"
}
```

---

## 本地构建与验证

```bash
# 验证并编译到 dist/ 目录
npm run build

# 递增数据库版本号并编译
npm run build:bump

# 编译并直接同步到邻近的 RollKeeper 桌面端源码目录
npm run build:sync
```

---

## 客户端下载与远程同步

RollKeeper 客户端内置同步功能，默认从本仓库的最新发布地址拉取：

- **RAW 源地址**：
  ```text
  https://raw.githubusercontent.com/Watfaq-legacy/RollKeeperGears/main/dist/gears.json
  ```
- **MIN 压缩源**：
  ```text
  https://raw.githubusercontent.com/Watfaq-legacy/RollKeeperGears/main/dist/gears.min.json
  ```

当仓库版本号高于客户端本地缓存时，桌面端会提示更新并自动完成拉取与热载入。

---

## License

MIT License
