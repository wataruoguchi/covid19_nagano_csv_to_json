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

## Specification

1. [長野県の Web ページ](https://www.pref.nagano.lg.jp/hoken-shippei/kenko/kenko/kansensho/joho/corona.html)に公開されている "オープンデータ" 対象の 3 種類の CSV をダウンロードします。ダウンロードしたファイルは csv フォルダに保存されます。

   1. _200000_nagano_covid19_patients.csv_ : [新型コロナウイルス感染症対策に関するオープンデータ項目定義書 01 陽性患者属性](https://www.code4japan.org/activity/stopcovid19)に準拠。
   1. _200000_nagano_covid19_test_count.csv_ : [新型コロナウイルス感染症対策に関するオープンデータ項目定義書 03 検査実施件数](https://www.code4japan.org/activity/stopcovid19)の拡張版。
   1. _200000_nagano_covid19_call_center.csv_ : [新型コロナウイルス感染症対策に関するオープンデータ項目定義書 05 コールセンター相談件数](https://www.code4japan.org/activity/stopcovid19)の拡張版。

1. CSV ファイルが SHIFT_JIS でエンコードされているため、UNICODE に変換します。変換されたファイルは [encoded フォルダ](https://github.com/wataruoguchi/covid19_nagano_csv_to_json/tree/master/src/.encoded)に保存されます。
1. CSV ファイルに再利用しにくい行がいくつかあるので削除し、JSON に変換します。JSON ファイルは [json フォルダ](https://github.com/wataruoguchi/covid19_nagano_csv_to_json/tree/master/src/.json)に保存されます。
1. 3 つのファイルより、`data.json` が生成され、同様に json フォルダに保存されます。

## About the JSON file

### 1. patients.json

The specs following the original format of [新型コロナウイルス感染症対策に関するオープンデータ項目定義書 01 陽性患者属性](https://www.code4japan.org/activity/stopcovid19).

### 2. test_count.json

The specs following the original format of [新型コロナウイルス感染症対策に関するオープンデータ項目定義書 03 検査実施件数](https://www.code4japan.org/activity/stopcovid19), plus additional properties below.

| Property    | Corresponding CSV Column | Desc.          |
| ----------- | ------------------------ | -------------- |
| positiveNum | 陽性\_人数               | 陽性患者人数   |
| negativeNum | 陰性\_人数               | 陰性性患者人数 |

### 3. call_center.json

The specs following the original format of [新型コロナウイルス感染症対策に関するオープンデータ項目定義書 05 コールセンター相談件数](https://www.code4japan.org/activity/stopcovid19), plus additional properties below.

| Property      | Corresponding CSV Column | Desc.        |
| ------------- | ------------------------ | ------------ |
| hasSymptomNum | 再掲：有症相談           | Support type |
| safetyNum     | 再掲：海外旅行安全性     | Support type |
| preventionNum | 再掲：感染症予防         | Support type |
| treatmentNum  | 再掲：感染症治療         | Support type |
| actionNum     | 再掲：発症時対応         | Support type |
| otherNum      | 再掲：その他             | Support type |

## Where would it be used

- [長野県 非公式 新型コロナウイルス感染症対策サイト / Nagano COVID-19 Task Force unofficial website](https://stop-covid19-nagano.netlify.app/)
- [https://github.com/Stop-COVID19-Nagano/covid19](https://github.com/Stop-COVID19-Nagano/covid19)
