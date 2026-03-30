---
title: "Webpack: основы конфигурации, loaders, plugins"
description: "Webpack — модульный бандлер для JavaScript. Разбираем entry, output, loaders, plugins, code splitting, оптимизацию и миграцию на Vite."
section: tools
difficulty: intermediate
readTime: 16
order: 3
tags: [webpack, bundler, loaders, plugins, code-splitting, build]
---

## Что такое Webpack

Webpack — это статический модульный бандлер для JavaScript-приложений. Он берёт множество файлов (JS, CSS, изображения, TypeScript) и собирает их в один или несколько файлов (bundle), которые браузер может загрузить.

Webpack работал стандартом сборки фронтенд-проектов с 2015 года. Сейчас его активно вытесняет Vite, но Webpack всё ещё используется в огромном количестве проектов — особенно в крупных Enterprise-приложениях и Create React App.

Основные понятия:
- **Entry** — точка входа, откуда Webpack начинает строить граф зависимостей
- **Output** — куда и как писать собранные файлы
- **Loaders** — обработчики файлов (превращают CSS в JS, TypeScript в JS)
- **Plugins** — расширения для задач, которые loaders не решают (минификация, HTML-генерация)

## Минимальная конфигурация

```bash
npm install -D webpack webpack-cli
```

```js
// webpack.config.js
const path = require('path')

module.exports = {
  mode: 'development',
  entry: './src/index.js',
  output: {
    path: path.resolve(__dirname, 'dist'),
    filename: 'bundle.js',
  },
}
```

```json
{
  "scripts": {
    "build": "webpack",
    "dev": "webpack serve"
  }
}
```

Для запуска dev-сервера:
```bash
npm install -D webpack-dev-server
```

## Entry — точка входа

### Одна точка входа

```js
module.exports = {
  entry: './src/index.js',
}
```

### Несколько точек входа (MPA)

```js
module.exports = {
  entry: {
    main: './src/index.js',
    admin: './src/admin.js',
    vendor: ['react', 'react-dom'],
  },
}
```

## Output — результат

```js
const path = require('path')

module.exports = {
  output: {
    path: path.resolve(__dirname, 'dist'),
    filename: '[name].[contenthash:8].js',      // main.a1b2c3d4.js
    chunkFilename: '[name].[contenthash:8].js',  // Для code splitting
    clean: true,                                 // Очищать dist перед сборкой
    publicPath: '/',                             // Базовый путь для ассетов
    assetModuleFilename: 'assets/[hash][ext][query]',
  },
}
```

Плейсхолдеры:
- `[name]` — имя entry-чанка
- `[contenthash]` — хеш содержимого (для кэширования)
- `[ext]` — расширение файла
- `[id]` — идентификатор чанка

## Loaders — обработка файлов

Webpack понимает только JS и JSON. Loaders учат его обрабатывать остальные форматы.

### Babel (JS → совместимый JS)

```bash
npm install -D babel-loader @babel/core @babel/preset-env @babel/preset-typescript
```

```js
module.exports = {
  module: {
    rules: [
      {
        test: /\.(js|ts)$/,
        exclude: /node_modules/,
        use: {
          loader: 'babel-loader',
          options: {
            presets: [
              ['@babel/preset-env', { targets: '> 0.25%, not dead' }],
              '@babel/preset-typescript',
            ],
          },
        },
      },
    ],
  },
}
```

### CSS

```bash
npm install -D css-loader style-loader
```

```js
{
  test: /\.css$/,
  use: ['style-loader', 'css-loader'],    // Порядок важен! Справа налево
}
```

`css-loader` читает CSS и резолвит `@import` и `url()`. `style-loader` вставляет CSS в `<style>` на страницу.

Для production CSS лучше извлекать в отдельный файл:

```bash
npm install -D mini-css-extract-plugin
```

```js
const MiniCssExtractPlugin = require('mini-css-extract-plugin')

{
  test: /\.css$/,
  use: [
    MiniCssExtractPlugin.loader,    // Вместо style-loader
    'css-loader',
  ],
}
```

### SCSS/Sass

```bash
npm install -D sass sass-loader
```

```js
{
  test: /\.scss$/,
  use: [
    MiniCssExtractPlugin.loader,
    'css-loader',
    'sass-loader',
  ],
}
```

### CSS Modules

```js
{
  test: /\.module\.css$/,
  use: [
    MiniCssExtractPlugin.loader,
    {
      loader: 'css-loader',
      options: { modules: true },
    },
  ],
}
```

### Изображения

Webpack 5 имеет встроенную поддержку ассетов:

```js
{
  test: /\.(png|jpg|jpeg|gif|svg|webp)$/i,
  type: 'asset',
  parser: {
    dataUrlCondition: {
      maxSize: 8 * 1024,    // < 8KB → inline data URL
    },
  },
  generator: {
    filename: 'images/[hash][ext][query]',
  },
}
```

### Шрифты

```js
{
  test: /\.(woff|woff2|eot|ttf|otf)$/i,
  type: 'asset/resource',
  generator: {
    filename: 'fonts/[hash][ext][query]',
  },
}
```

### Vue SFC

```bash
npm install -D vue-loader @vue/compiler-sfc
```

```js
const { VueLoaderPlugin } = require('vue-loader')

module.exports = {
  module: {
    rules: [
      {
        test: /\.vue$/,
        loader: 'vue-loader',
      },
    ],
  },
  plugins: [new VueLoaderPlugin()],
}
```

### Полная секция module.rules

```js
module: {
  rules: [
    { test: /\.(js|ts)$/, exclude: /node_modules/, use: 'babel-loader' },
    { test: /\.vue$/, use: 'vue-loader' },
    { test: /\.css$/, use: [MiniCssExtractPlugin.loader, 'css-loader'] },
    { test: /\.scss$/, use: [MiniCssExtractPlugin.loader, 'css-loader', 'sass-loader'] },
    { test: /\.(png|jpg|gif|svg|webp)$/, type: 'asset' },
    { test: /\.(woff2?|eot|ttf|otf)$/, type: 'asset/resource' },
  ],
},
```

## Plugins — расширение функциональности

Плагины работают на уровне всего процесса сборки — они имеют доступ ко всем чанкам, модулям и ассетам.

### HtmlWebpackPlugin

Генерирует HTML-файл и автоматически добавляет ссылки на JS и CSS:

```bash
npm install -D html-webpack-plugin
```

```js
const HtmlWebpackPlugin = require('html-webpack-plugin')

plugins: [
  new HtmlWebpackPlugin({
    template: './public/index.html',
    title: 'Мое приложение',
    favicon: './public/favicon.ico',
    minify: {
      collapseWhitespace: true,
      removeComments: true,
    },
  }),
],
```

### MiniCssExtractPlugin

```js
const MiniCssExtractPlugin = require('mini-css-extract-plugin')

plugins: [
  new MiniCssExtractPlugin({
    filename: 'css/[name].[contenthash:8].css',
    chunkFilename: 'css/[name].[contenthash:8].css',
  }),
],
```

### CopyWebpackPlugin

Копирует статические файлы:

```js
const CopyPlugin = require('copy-webpack-plugin')

plugins: [
  new CopyPlugin({
    patterns: [
      { from: 'public', to: 'dist', globOptions: { ignore: ['**/index.html'] } },
    ],
  }),
],
```

### DefinePlugin (встроен)

Подменяет константы при сборке:

```js
const { DefinePlugin } = require('webpack')

plugins: [
  new DefinePlugin({
    'process.env.NODE_ENV': JSON.stringify('production'),
    __VUE_OPTIONS_API__: 'true',
    __VUE_PROD_DEVTOOLS__: 'false',
  }),
],
```

### ProgressPlugin (встроен)

Показывает прогресс сборки:

```js
const { ProgressPlugin } = require('webpack')

plugins: [new ProgressPlugin()],
```

## Code Splitting

Code splitting разбивает бандл на несколько файлов, которые загружаются по необходимости.

### SplitChunksPlugin

```js
optimization: {
  splitChunks: {
    chunks: 'all',
    cacheGroups: {
      vendor: {
        test: /[\\/]node_modules[\\/]/,
        name: 'vendor',
        chunks: 'all',
      },
      common: {
        name: 'common',
        minChunks: 2,
        chunks: 'initial',
        reuseExistingChunk: true,
      },
    },
  },
},
```

### Dynamic Import

```js
const Dashboard = () => import(/* webpackChunkName: "dashboard" */ './views/Dashboard.vue')
const Settings = () => import(/* webpackChunkName: "settings" */ './views/Settings.vue')

const routes = [
  { path: '/dashboard', component: Dashboard },
  { path: '/settings', component: Settings },
]
```

Webpack создаст отдельные чанки `dashboard.js` и `settings.js`, которые загрузятся только при переходе на соответствующий маршрут.

## Resolve — резолвинг модулей

```js
resolve: {
  extensions: ['.ts', '.js', '.vue', '.json'],
  alias: {
    '@': path.resolve(__dirname, 'src'),
    '@components': path.resolve(__dirname, 'src/components'),
  },
  modules: [path.resolve(__dirname, 'src'), 'node_modules'],
},
```

## Webpack Dev Server

```js
devServer: {
  static: {
    directory: path.join(__dirname, 'public'),
  },
  port: 3000,
  hot: true,                     // Hot Module Replacement
  open: true,
  historyApiFallback: true,      // SPA-маршрутизация
  compress: true,
  proxy: {
    '/api': {
      target: 'http://localhost:8080',
      changeOrigin: true,
    },
  },
},
```

## Source Maps

```js
devtool: 'eval-cheap-module-source-map',     // Dev: быстро, достаточно информации
// или для production:
devtool: 'source-map',                       // Полные source maps
// или без source maps:
devtool: false,
```

Основные варианты:

| devtool | Скорость сборки | Качество | Когда использовать |
|---|---|---|---|
| `eval` | Очень быстро | Строки | Только dev |
| `eval-cheap-module-source-map` | Быстро | Строки + колонки | Dev (рекомендуемый) |
| `source-map` | Медленно | Идеально | Production |
| `hidden-source-map` | Медленно | Идеально | Production (не виден в DevTools) |

## Оптимизация для production

```js
const { BundleAnalyzerPlugin } = require('webpack-bundle-analyzer')
const TerserPlugin = require('terser-webpack-plugin')
const CssMinimizerPlugin = require('css-minimizer-webpack-plugin')

module.exports = {
  mode: 'production',

  optimization: {
    minimize: true,
    minimizer: [
      new TerserPlugin({
        terserOptions: {
          compress: { drop_console: true },
        },
      }),
      new CssMinimizerPlugin(),
    ],
    splitChunks: {
      chunks: 'all',
    },
    runtimeChunk: 'single',
  },

  plugins: [
    new BundleAnalyzerPlugin({ analyzerMode: 'static', openAnalyzer: false }),
  ],

  performance: {
    hints: 'warning',
    maxEntrypointSize: 512000,
    maxAssetSize: 512000,
  },
}
```

## Полная конфигурация

```js
const path = require('path')
const { VueLoaderPlugin } = require('vue-loader')
const HtmlWebpackPlugin = require('html-webpack-plugin')
const MiniCssExtractPlugin = require('mini-css-extract-plugin')
const { DefinePlugin } = require('webpack')

module.exports = (env, argv) => {
  const isDev = argv.mode === 'development'

  return {
    mode: isDev ? 'development' : 'production',
    entry: './src/main.ts',
    output: {
      path: path.resolve(__dirname, 'dist'),
      filename: isDev ? '[name].js' : '[name].[contenthash:8].js',
      clean: true,
    },
    resolve: {
      extensions: ['.ts', '.js', '.vue', '.json'],
      alias: { '@': path.resolve(__dirname, 'src') },
    },
    module: {
      rules: [
        { test: /\.vue$/, loader: 'vue-loader' },
        { test: /\.ts$/, exclude: /node_modules/, loader: 'babel-loader' },
        {
          test: /\.css$/,
          use: [isDev ? 'style-loader' : MiniCssExtractPlugin.loader, 'css-loader'],
        },
        { test: /\.(png|jpg|svg|gif)$/, type: 'asset' },
        { test: /\.(woff2?|ttf|eot)$/, type: 'asset/resource' },
      ],
    },
    plugins: [
      new VueLoaderPlugin(),
      new HtmlWebpackPlugin({ template: './public/index.html' }),
      new MiniCssExtractPlugin({ filename: '[name].[contenthash:8].css' }),
      new DefinePlugin({ __VUE_OPTIONS_API__: 'true' }),
    ],
    devServer: {
      port: 3000,
      hot: true,
      historyApiFallback: true,
    },
    devtool: isDev ? 'eval-cheap-module-source-map' : 'source-map',
  }
}
```

## Сравнение с Vite

| Критерий | Webpack | Vite |
|---|---|---|
| Старт dev | Медленный (бандлит всё) | Мгновенный (ESM) |
| HMR | 1–5 сек | < 50 мс |
| Конфигурация | Сложная, много бойлерплейта | Простой объект |
| TypeScript | Нужен babel-loader или ts-loader | Из коробки через esbuild |
| Экосистема | Огромная, зрелая | Растёт |
| Кривая обучения | Высокая | Низкая |

## Миграция с Webpack на Vite

Если у вас есть проект на Webpack и вы хотите перейти на Vite:

1. Установите Vite и нужные плагины
2. Переместите `index.html` из `public/` в корень
3. Добавьте `<script type="module" src="/src/main.ts">`
4. Перепишите `webpack.config.js` → `vite.config.ts`
5. Замените loaders на плагины Vite
6. Замените `require()` на `import`
7. Удалите `@babel/preset-env` — Vite использует esbuild

## Итог

- Webpack — мощный и гибкий бандлер, но с высокой кривой обучения
- Loaders обрабатывают файлы (CSS, TypeScript, изображения)
- Plugins расширяют возможности (HTML-генерация, минификация, анализ бандла)
- Для новых проектов лучше использовать Vite
- Знание Webpack полезно — много существующих проектов и Enterprise-кода на нём
- Webpack 5 внёс улучшения (Module Federation, asset modules, persistent cache), но Vite всё равно быстрее
