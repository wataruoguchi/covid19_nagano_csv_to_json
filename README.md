# COVID-19 Nagano CSV to JSON

## What's this

長野県が公開している CSV ファイルをダウンロードし、再利用可能な JSON へ変換するスクリプトです。

The script that downloads open data "CSV" files and convert them into reusable JSON files.

## How to run

このスクリプトは GitHub Actions で毎時実行され、長野県の公表しているデータの取得を試みます。
It's running every hour by GitHub Actions, to try fetching new CSV files then update files under `src/.encoded` and `src/.json` automatically.

### Locally...

ローカル環境で実行する場合。

```
$ yarn start
```

日付を指定してファイルダウンロードすることもできます。毎回古いのはサーバから非公開にされてしまうので、そんなに役に立つことはないと思います。
You can set a specific date to download CSV files.

```
$ yarn start -d <MMDD>
```

Example: `$ yarn start -d 0323`

ダウンロード済みのファイルに対して実行することもできます。開発用。
Once you've downloaded CSV files by the script, you could run offline mode. It's meant to be for developing.

```
$ yarn start --offline -d <MMDD>
```

## Specification

1. [長野県の Web ページ](https://www.pref.nagano.lg.jp/hoken-shippei/kenko/kenko/kansensho/joho/bukan-haien-doko.html)に公開されている "オープンデータ" 対象の２種類の CSV をダウンロードします。ダウンロードしたファイルは csv フォルダに保存されます。

   1. _kensaXXXX.csv_ : 新型コロナウイルス感染症に係る検査件数について
   1. _soudanXXXX.csv_ : 新型コロナウイルス感染症に関する相談状況について

1. CSV ファイルが SHIFT_JIS でエンコードされているため、UNICODE に変換します。変換されたファイルは [encoded フォルダ](https://github.com/wataruoguchi/covid19_nagano_csv_to_json/tree/master/src/.encoded)に保存されます。
1. CSV ファイルに再利用しにくい行がいくつかあるので削除し、JSON に変換します。現時点でそれぞれのファイルの最初の 5 行と最後の 2 行を削除しています。JSON ファイルは [json フォルダ](https://github.com/wataruoguchi/covid19_nagano_csv_to_json/tree/master/src/.json)に保存されます。
1. 二つのファイルより、`data.json` が生成され、同様に json フォルダに保存されます。

## About the JSON file

### 1. kensa.json

| Property  | Corresponding CSV Column     | Desc.                        |
| --------- | ---------------------------- | ---------------------------- |
| date      | 日付                         |                              |
| num_total | 検査件数（人）               |                              |
| num_sub1  | うち信大医学部付属病院委託分 |                              |
| num_sub2  | うち長野市検査分             |                              |
| misc      | 備考                         |                              |
| positive  | -                            | 陽性数(備考欄より抽出)       |
| negative  | -                            | 陰性数(num_total - positive) |

### 2. soudan.json

| Property        | Corresponding CSV Column               | Desc. |
| --------------- | -------------------------------------- | ----- |
| date            | 日付                                   |       |
| num_total       | 相談件数（実）                         |       |
| num_has_symptom | 有症相談                               |       |
| num_safety      | 海外旅行の安全性について               |       |
| num_prevention  | 新型コロナウイルス感染症の予防について |       |
| num_treatment   | 新型コロナウイルス感染症の治療について |       |
| num_action      | 発症時の対応について                   |       |
| num_others      | その他                                 |       |

### 3. hasseijoukyou.json

| Property  | Corresponding CSV Column | Desc. |
| --------- | ------------------------ | ----- |
| no        | NO.                      |       |
| date      | 確定日                   |       |
| age_group | 年代                     |       |
| gender    | 性別                     |       |
| area      | 居住地                   |       |
| status    | 患者の状況               |       |
| status2   | 濃厚接触者の状況         |       |
| misc      | 備考                     |       |
| group     | -                        | \*1   |

_\*1_: 長野県内の新型コロナウイルス感染症患者の発生状況: 1, 長野県内の新型コロナウイルス感染症無症状病原体保有者の発生状況: 2

## Where would it be used

- [長野県 非公式 新型コロナウイルス感染症対策サイト / Nagano COVID-19 Task Force unofficeial website](https://stop-covid19-nagano.netlify.app/)
- [https://github.com/Stop-COVID19-Nagano/covid19](https://github.com/Stop-COVID19-Nagano/covid19)
