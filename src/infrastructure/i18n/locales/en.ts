import type { Translations } from './ja'

export const en: Translations = {
  'app.title': 'Magical Mirai Setlist Archive',
  'app.description': 'Browse the setlists of every Hatsune Miku "Magical Mirai" concert by year',

  'meta.editionTitle': '{name} Setlist',
  'meta.editionDescription': 'Setlist of {name}, listed by performance and date.',

  'nav.newerEdition': 'Newer year',
  'nav.olderEdition': 'Older year',
  'nav.jumpToEdition': 'Jump to year',

  'search.open': 'Search songs',
  'search.placeholder': 'Search by song or producer',
  'search.filterByVocaloid': 'Filter by Vocaloid',
  'search.empty': 'No matching songs',
  'search.results': '{count} songs',
  'search.appearedIn': 'Performed in',
  'search.close': 'Close',

  'edition.performances': 'Performances',
  'edition.noSetlist': 'The setlist for this year has not been collected yet',
  'edition.trackCount': '{count} songs',
  'edition.officialSite': 'Official site',
  'edition.venueUnknown': 'Venue TBA',

  'session.matinee': 'Matinee',
  'session.evening': 'Evening',

  'tag.encore': 'Encore',
  'tag.theme-song': 'Theme song',
  'tag.grand-prix': 'Song Grand Prix',
  'tag.band-intro': 'Band introduction',
  'tag.bonus-track': 'Bonus track',

  'track.variation.venue': 'Varies by venue',
  'track.variation.schedule': 'Varies by date',
  'track.variation.daily': 'Rotating',
  'track.singers': 'Vocals',

  'song.preview': 'Preview',
  'song.playOnYoutube': 'Play on YouTube',
  'song.searchOnYoutube': 'Search on YouTube',
  'song.openSpotify': 'Open in Spotify',
  'song.searchSpotify': 'Search on Spotify',
  'song.openAppleMusic': 'Open in Apple Music',
  'song.searchAppleMusic': 'Search on Apple Music',
  'song.noEmbed': 'No video has been registered for this song yet',
  'song.close': 'Close',

  'about.open': 'About this site',
  'about.title': 'About this site',
  'about.description':
    'A site for looking back at the setlists of every Hatsune Miku "Magical Mirai" concert. The contents are compiled by the site owner from unofficial sources such as X. The owner accepts no liability for any damages arising from the accuracy of this information.',
  'about.data.title': 'About the data',
  'about.data.description':
    'Setlists are compiled from the official site and fan-maintained summaries.',
  'about.author': 'Author',
  'about.sourceCode': 'Source code',
  'about.sources': 'Sources',
  'about.source.official': 'Magical Mirai official site',
  'about.source.wiki': 'Hatsune Miku Wiki',
  'about.disclaimer': 'All rights to the songs and concerts belong to their respective holders.',
  'about.close': 'Close',

  'statistics.open': 'View statistics',
  'statistics.title': 'Statistics',
  'statistics.description': 'Aggregated across every edition on record.',
  'statistics.editionCount': 'Editions counted',
  'statistics.performanceCount': 'Performances (total)',
  'statistics.producerCount': 'Producers',
  'statistics.results': '{count} entries',
  'statistics.showMore': 'Show more',
  'statistics.unit.songs': 'songs',
  'statistics.unit.editions': 'editions',
  'statistics.appearances': '{count} performances',
  'statistics.producers.title': 'Songs performed per producer',
  'statistics.songs.title': 'Performance count',
  'statistics.songs.help':
    'How many editions the song was performed at. Appearing in several slots of the same edition still counts once.',
  'statistics.vocaloids.title': 'Songs per Vocaloid',
  'statistics.vocaloids.description': 'Songs counted for each Vocaloid who sang them.',
  'statistics.vocaloids.trend.title': 'Songs per edition',
  'statistics.vocaloids.trend.perEdition': 'Per edition',
  'statistics.vocaloids.trend.cumulative': 'Cumulative',
  'statistics.vocaloids.trend.perEditionHelp': 'Songs sung at that edition.',
  'statistics.vocaloids.trend.cumulativeHelp':
    'Songs sung up to that edition. A song sung again at a later edition still counts once, so the values are not a running sum.',
  'statistics.vocaloids.solo.title': 'Solo songs',
  'statistics.vocaloids.solo.help':
    'Songs sung by that Vocaloid alone. Songs shared with others are not counted.',

  'a11y.viewEdition': 'View the {year} setlist',
  'a11y.help': 'Show explanation',
  'a11y.selectPerformance': 'Show the setlist for {city}',
  'a11y.authorOnX': "Open {name}'s profile on X",
  'a11y.songDetail': 'Open details for {title}',
  'a11y.pictureInPicture': 'Keep playing in the corner',
  'a11y.expandPlayer': 'Reopen details for {title}',
  'a11y.closePlayer': 'Close the playing video',
  'a11y.vocaloidTrend': 'Line chart of songs per edition for each Vocaloid',
  'a11y.vocaloidTrendTotal': 'Line chart of cumulative songs per edition for each Vocaloid',

  'locale.select': 'Language',

  'footer.disclaimer': 'An unofficial archive made by fans',
}
