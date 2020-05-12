+++
title="読了よく分かるgRPC"
date=2020-05-13
category="読了"
[taxonomies]
tags=[""]
[extra]
img="yokuwakaru-grpc"
+++

[よくわかるgRPC](https://booth.pm/ja/items/1557285)を読了しました。2020 年読了本 11 冊目。

## 最初のまとめ

* gRPC とは何かから、hello world、その他連携サービスまでまとまってる
* Wireshark を使って、パケットキャプチャもする
* パケットキャプチャすることで、セキュアな通信が体感しやすい

## 読み始めの動機

gRPC を使う案が出てきたが、そもそも RPC ってなにそれおいしいの状態だったので勉強のため。

## 概要

RPC の概要から、 gRPC の説明。その後、 Go を使って、 gRPC の hello world。最後に、 gRPC を便利にするツールの紹介。 gRPC に関して、まとまってる本。

本にまとまってるけど、改めて各単語の自分なりのまとめを次に書いていく。

## RPC とは

  `Remote Procedure Call` の略。
  
  外部にある処理やリソースの取得をするために、外部のプログラムを呼び出す。リソースが分割されている際に、 RPC を使って、連結を行うことがある。そのため、サービス分割が前提のマイクロサービスの文脈でよく登場する。
  
![rpc](/img/content/yokuwakaru-grpc/rpc.png)

### gRPC とは

Google 製の RPC フレームワーク。

HTTP/2 が使えるので、より高速にしやすく、並行してリソースの取得ができる。マイクロサービスのように分割されたサービスを連携させるとき、HTTP1.x だと Head of Line ブロッキングが速度を出す上で問題になりうるが、 HTTP/2 だとそれが解決できる。

ちなみに RPC のフレームワークではよく gRPC が取り上げられるが、 gRPC 以外にもいろいろとある。

また、 HTTP/2 自体について学びたい方は次の本がお勧めです。
* [Real World HTTP 第2版 ―歴史とコードに学ぶインターネットとウェブ技術](https://amzn.to/3coYj9o)
* [ハイパフォーマンス ブラウザネットワーキング ―ネットワークアプリケーションのためのパフォーマンス最適化 (日本語)](https://amzn.to/2WRHzBg)

特に [Real World HTTP](https://amzn.to/3coYj9o)は 今年の4 月（2020/4/21）に第 2 版が出たばかりで、最新の情報も載っているようです。 Go 言語で実際に HTTP/1.x から HTTP/2 まで実装例も載っているので、 Go の勉強もできてお得。僕は初版しか読んでないので、そのうち読みます。

### gRPC のライフサイクル

4つある。
1. Unary RPC
2. Server streaming RPC
3. Client streaming RPC
4. Bidirectional streaming RPC

#### Unary RPC

Unary は`単項`という意味です。クライアントがサーバーにリクエストを送り、サーバーがレスポンスを返却します。サーバーとクライアントを 1 往復して終了するもっともシンプルな RPCです。

![unary](/img/content/yokuwakaru-grpc/unary.png)

#### Server streaming RPC

Unary RPC と似ているが、サーバーはストリーミングを返却します。ストリーミングは複数のレスポンスを返却するようなイメージで、通知などの用途で使われます。

![server_streaming](/img/content/yokuwakaru-grpc/server_streaming.png)

#### Client streaming RPC

これも Unary RPC と似ているが、クライアントがストリーミングをサーバーに送ります。この場合、クライアントが複数のリクエストを送信するようなイメージで、ファイルアップロードなどの用途で使われます。

![client_streaming](/img/content/yokuwakaru-grpc/client_streaming.png)
#### Bidirectional streaming RPC

クライアントがメソッドを呼び出し、サーバーが複数のレスポンスをストリーミングで返却します。クライアントは複数のリクエストを送信できます。チャットなどの用途で使われます。

![bidirectional](/img/content/yokuwakaru-grpc/bidirectional.png)

### gRPC 便利機能

#### Interceptor

gRPC の前後に処理を挟むことできる機能です。ログや認証など共通処理を実装します。  リクエストレスポンスが 1 往復する Unary Interceptor だけでなく、 Stream Interceptor も存在しており、複数のリクエスト or レスポンスが使えるようです。

![interceptor](/img/content/yokuwakaru-grpc/interceptor.png)

Stream Interceptor の使いどころはなんだろうか。一定のインターバルでクライアントの状況を送ったり、通知を送ったりでログをためるみたいに使えそう。

#### Load Balancing

RPC の通信先を分散するロードバランサーです。 RPC 単位でのバランシング可能なのが特徴的でした。 RPC 単位なので、サーバー側の実装でラウンドロビンでの分散も可能ですが、あんまり実装することはないかなという印象。 gRPC 対応の外部ロードバランサーも紹介されているので、基本的にはそういうツール頼りになりそう。

## 写経時にハマったところ

Go 言語での実装例を写経してましたが、いくつかハマったので、まとめておきます。作業環境は Macbook Pro 2015 、作業者（僕）は Go 言語初心者です。

### Go 言語自体のインストール

書いてなかったので、ちょっと悩みました。普通に brew でインストールできました。
```
brew install go
```

### PATH が通ってない的なエラーメッセージが出て実行できなかった

`protoc ./greeter.proto --go_out=plugins=grpc:.`
のコマンドで PATH が通ってない的なエラーが出ました。
```
protoc ./greeter.proto --go_out=plugins=grpc:.
protoc-gen-go: program not found or is not executable
Please specify a program using absolute path or make sure the program is available in your PATH system variable
--go_out: protoc-gen-go: Plugin failed with status code 1.
```

エラーメッセージのとおりで、 PATH を通せば OK です。具体的には .bashrc に追記しました。（要 source コマンド）
```.bashrc
export GOPATH=$HOME/go
export PATH=$PATH:$GOPATH/bin
```

検索すると、 `$HOME/go` を書けみたいな回答をいろいろと見ましたが、 `which go` の結果と異なり悩みました。インストール時に、`$HOME/go`のディレクトリが作成され、バイナリなどが置かれるようです。

### インポートが必要なパッケージ名がわからない

Metadata をつけて通信のところで、 metadata のインポートの仕方が書いてなくてハマりました。これは下記ドキュメントで使いたいパッケージを検索し、インポート文をコピペすれば OK です。

ドキュメント: [https://godoc.org/](https://godoc.org/)

### 認証を使うところで、認証エラーが出た

エラーメッセージは下記。
```
gRPC Error (message :connection error: desc = "transport: authentication handshake failed: tls: either ServerName or InsecureSkipVerify must be specified in the tls.Config")
```

これは client.go で addr 変数に IP とポート番号を代入するところで、代入の仕方がミスってました。

```誤
addr := ":50051"
```

```正
addr := "localhost:50051"
```

Insecure で通信すると、 IP を指定しなくても動くので IP 指定しなかったことに気づいてませんでした。認証を使う場合、 IP の指定が必要で、認証エラーが正しく出てました。ちゃんと認証エラーで弾かれるのが体験できてよかったです。

### Resolver の type がタイポしてる

55,56ページにあるコードを写経すると下記エラーが出ます。
```
undefined: resolver.BuildOption
undefined: resolver.ResolveNowOption
```

これは本のコードが間違えてるようで、正しくは BuildOptions 及び ResolveNowOptions で末尾に s が付きます。
[https://godoc.org/google.golang.org/grpc/resolver#BuildOptions](https://godoc.org/google.golang.org/grpc/resolver#BuildOptions)
[https://godoc.org/google.golang.org/grpc/resolver#ResolveNowOptions](https://godoc.org/google.golang.org/grpc/resolver#ResolveNowOptions)

## 感想

ひとまずひととおり入門するにはいい本でした。マイクロサービスの文脈で gRPC をよく見る理由が何となく分かる。 Go 言語ははじめてまともに書きましたが、若干キモいかなくらいでそんなに多くの感想はいだきませんでした。知ってる限り、 R 言語が一番気持ち悪いです（※個人の感想です）が、個人の感情を乗り越えて書いていたので特段何も思いませんでした。

むしろ[フォーマッティング](http://go.shibu.jp/effective_go.html#id4)が強制されるため、メリットのほうが強そうです。

## まとめ

gRPC のメリットデメリットや、採用するか否かの議論ができるくらいには理解できたのでよかったです。

[よくわかるgRPC](https://booth.pm/ja/items/1557285)