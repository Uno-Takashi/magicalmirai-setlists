/** 日本語。他ロケールはこの型に従う。 */
export const ja = {
  'app.title': 'マジカルミライ 歴代セットリスト',
  'app.description': '初音ミク「マジカルミライ」歴代公演のセットリストを年ごとに振り返る',

  'meta.editionTitle': '{name} セットリスト',
  'meta.editionDescription': '{name} の公演セットリスト。公演・日程ごとの曲順を掲載しています。',

  'nav.newerEdition': '新しい年',
  'nav.olderEdition': '古い年',
  'nav.jumpToEdition': '年を選ぶ',

  'search.open': '曲名で検索',
  'search.placeholder': '曲名・P名で検索',
  'search.filterByVocaloid': 'ボーカロイドで絞り込む',
  'search.empty': '一致する曲がありません',
  'search.results': '{count} 曲',
  'search.appearedIn': '登場した年',
  'search.close': '閉じる',

  'edition.performances': '公演',
  'edition.noSetlist': 'この年のセットリストはまだ収集できていません',
  'edition.trackCount': '全 {count} 曲',
  'edition.officialSite': '公式サイト',
  'edition.venueUnknown': '会場未定',

  'session.matinee': '昼公演',
  'session.evening': '夜公演',

  'tag.encore': 'アンコール',
  'tag.theme-song': 'テーマソング',
  'tag.grand-prix': '楽曲グランプリ',
  'tag.band-intro': 'バンド紹介',
  'tag.bonus-track': 'ボーナストラック',

  'track.variation.venue': '会場替わり',
  'track.variation.schedule': '日程替わり',
  'track.variation.daily': '日替わり',
  'track.singers': '歌唱',

  'song.preview': 'プレビュー',
  'song.playOnYoutube': 'YouTube で再生',
  'song.searchOnYoutube': 'YouTube で検索',
  'song.openSpotify': 'Spotify で開く',
  'song.searchSpotify': 'Spotify で検索',
  'song.openAppleMusic': 'Apple Music で開く',
  'song.searchAppleMusic': 'Apple Music で検索',
  'song.noEmbed': 'この曲はまだ動画が登録されていません',
  'song.close': '閉じる',

  'about.open': 'このサイトについて',
  'about.title': 'このサイトについて',
  'about.description':
    '初音ミク「マジカルミライ」の歴代公演のセットリストを振り返れるサイトです。X などの非公式な情報ソースを基に、管理者がまとめたものです。情報の正確性によって生じる損害について、管理者は責任を負いません。',
  'about.data.title': 'データについて',
  'about.data.description': 'セットリストは公式サイトと有志のまとめを参照しています。',
  'about.author': '作者',
  'about.sourceCode': 'ソースコード',
  'about.sources': '出典',
  'about.source.official': 'マジカルミライ公式サイト',
  'about.source.wiki': '初音ミク Wiki',
  'about.disclaimer': '楽曲・公演に関する権利は各権利者に帰属します。',
  'about.close': '閉じる',

  'statistics.open': '統計を見る',
  'statistics.title': '統計',
  'statistics.description': '歴代のセットリストから集計しています。',
  'statistics.editionCount': '開催数',
  'statistics.performanceCount': '演奏回数(累計)',
  'statistics.producerCount': 'ボカロ P',
  'statistics.backToOverview': '統計に戻る',
  'statistics.results': '全 {count} 件',
  'statistics.showMore': 'もっと見る',
  'statistics.unit.songs': '曲',
  'statistics.unit.editions': '回',
  'statistics.unit.times': '回',
  'statistics.unit.people': '人',
  'statistics.appearances': '延べ {count} 回',
  'statistics.producers.title': 'ボカロ P ごとの採用楽曲数',
  'statistics.songs.title': '演奏回数',
  'statistics.songs.help':
    'その曲が演奏された開催回の数。同じ年度に複数回演奏されたとしても１度とカウントします。',
  'statistics.vocaloids.title': 'ボーカロイド別の曲数',
  'statistics.vocaloids.description': '歌唱ボーカロイドごとに、演奏された曲を数えています。',
  'statistics.vocaloids.trend.title': '開催回ごとの曲数',
  'statistics.vocaloids.trend.perEdition': '年ごと',
  'statistics.vocaloids.trend.cumulative': '累積',
  'statistics.vocaloids.trend.perEditionHelp': 'その開催回で歌った曲の数。',
  'statistics.vocaloids.trend.cumulativeHelp':
    'その開催回までに歌った曲の数。同じ曲を別の回でまた歌っても 1 曲と数えるので、各年の値の足し算にはなりません。',
  'statistics.vocaloids.solo.title': 'ソロ曲数',
  'statistics.vocaloids.solo.help':
    'そのボーカロイド 1 人だけで歌った曲の数。複数人で歌った曲は数えません。',

  'a11y.viewEdition': '{year}年のセットリストを見る',
  'a11y.help': '説明を見る',
  'a11y.selectPerformance': '{city}公演のセットリストを表示',
  'a11y.authorOnX': '{name} の X のプロフィールを開く',
  'a11y.songDetail': '「{title}」の詳細を開く',
  'a11y.pictureInPicture': '右下に縮めて再生を続ける',
  'a11y.expandPlayer': '「{title}」の詳細をもう一度開く',
  'a11y.closePlayer': '再生中の動画を閉じる',
  'a11y.vocaloidTrend': '開催回ごとの、ボーカロイド別の曲数の折れ線グラフ',
  'a11y.vocaloidTrendTotal': '開催回ごとの、ボーカロイド別の曲数の累積の折れ線グラフ',

  'locale.select': '言語',

  'footer.disclaimer': '本サイトはファンによる非公式のアーカイブです',
} as const

export type TranslationKey = keyof typeof ja
export type Translations = Record<TranslationKey, string>
