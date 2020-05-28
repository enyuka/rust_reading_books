const fs = require('fs');
const path = require('path');
const directory_path = '../content/';

const convertContent = (filepath, args) => {
  const filename = path.basename(filepath);
  const target_ext = '.md';
  if (filename.lastIndexOf(target_ext) === -1) {
    // md 以外は何もしない
    return;
  }
  
  let text = fs.readFileSync(filepath, "utf8");
  if (text[0] === '+') {
    // すでにヘッダーの情報が付与されているファイルは処理しない
    return;
  }
  
  // h1 を title に使用する
  const regex = /# .*/;
  const result = text.match(regex);
  // substring(2) で改行を削除している
  const title = result[0].substring(2);
  
  // filename から拡張子(.md)を取り除いた名前が画像ファイル名
  const img = filename.substring(0, filename.length - 3);
  
  // h1 がある 1 行目を削除
  text = text.replace(regex, '');
  
  // 今日の日付を date に入れる
  let date = new Date();
  // JST に変換
  date.setTime(date.getTime() + 1000 * 60 * 60 * 9);
  date = date.toISOString().split('T')[0];

  // 画像のパスをローカルのパスからサイト上で利用可能なパスに置換する
  // 例: ![hoge](../static/img/hoge.jpg) を ![hoge](/img/hoge.jpg) にする
  const img_regex = /\.\.\/static/g;
  text = text.replace(img_regex, '');

  // tags の設定
  let tags = '';
  args.forEach((arg) => {
    tags += `"${arg}", `;
  });
  
  if (tags === '') {
    tags = '[""]';
  } else {
    // 末尾のカンマとスペースを削除
    tags = `[${tags.substring(0, tags.length - 2)}]`;
  }
  
  text = `+++
title="${title}"
date=${date}
category="読了"
[taxonomies]
tags=${tags}
[extra]
img="${img}"
+++${text}`;
  
  // ヘッダー情報を付与して書き換え
  fs.writeFileSync(filepath, text);
};

const convertAllContents = () => {
  fs.readdir(directory_path, (err, files) => {
    if (err) throw err;
    
    files.forEach((file) => {
      const filepath = directory_path + file;
      convertContent(filepath, []);
    });
  });
};

if (process.argv.length > 2) {
  const argv = process.argv;
  // 引数が指定されたときは指定されたファイルのみを変換して、 tags を付与する
  convertContent(argv[2], argv.slice(3));
} else {
  // 引数が指定されないときはディレクトリを一括でデフォルトの情報を付与する
  convertAllContents();
}
