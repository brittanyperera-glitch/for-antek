import { useState, useRef, useEffect } from 'react'

const TRACKS = [
  {
    side: 'A',
    number: 1,
    title: 'TIEDUPRIGHTNOW',
    songSrc: '/songs/tieduprightnow.mp3',
    description:
      'chapter one. i was britt. you were antek. you took the backseat of the car and I was just in front. the first of many glitches, because it seems the one song you\'d been bumping on your long and tiresome journey to Vietnam, I had already played. told you I had good music taste. this one is for the pre antek era, when you were Antoni to me and you were the random guy who rocked up in the green tshirt which is now mine (youre not getting it back)',
  },
  {
    side: 'A',
    number: 2,
    title: 'HELLO MISS JOHNSON',
    songSrc: '/songs/ytmp3free.cc_jack-harlow-hello-miss-johnson-youtubemp3free.org.mp3',
    description:
      '"Show you off to the city I\'m from\nAnd ride \'round with you, fine dine with you"\n\nthis one came in the interlude. while we were still adding "but no pressure like you\'re free to do what you want we haven\'t put any labels on anything" to the end of sentences. the \'habibi come to Warsaw\' period. the \'I really like you\' period. You showed me this song and told me it hit scary close to home. little did we know, Mr Harlow was a prophet. there\'s even a "We could go Monaco" line in there. glitch.',
  },
  {
    side: 'A',
    number: 3,
    title: 'FAIR PLAY',
    songSrc: '/songs/fair%20play.mp3',
    description:
      'head in your lap in the back of the defender. the time you were on the aux and the first time I went "hey this is a banger" and added one of your songs to my playlist. inbetween early mornings and night time work shifts, this song is the song that reminds me of that little routine- you sat, me horizontal with your hands in my hair',
  },
  {
    side: 'A',
    number: 4,
    title: "MAYBE IT'S YOU",
    songSrc: '/songs/Hajaj%20-%20Maybe%20Its%20You%20(Official%20Video).mp3',
    description:
      '"Who would\'ve thunk?\nWho would\'ve known?"\n\nnot me. Yet here we are. And I can\'t imagine it any other way. From tieduprightnow day one, to knowing that I really do think it\'s you. I love you.',
  },
  {
    side: 'B',
    number: 1,
    title: 'SUNNY',
    songSrc: '/songs/ytmp3free.cc_sunny-bobby-hebb-lyrics-youtubemp3free.org.mp3',
    description:
      'Warsaw. This one is me and you in that apartment. You\'d rented a speaker, you\'d sorted the house out, on one meniscus. There was beef jerky and Diet Coke and yoghurt when I got there and this song playing on repeat for the 3 day trip where you went from \'the polish guy im seeing\' to my boyfriend, when \'I really really really like you\' became \'I love you.\'',
  },
  {
    side: 'B',
    number: 2,
    title: 'B-A-B-Y',
    songSrc: '/songs/ytmp3free.cc_carla-thomas-baby-official-audio-youtubemp3free.org.mp3',
    description:
      'cooking pancakes in a baggy tshirt, dancing in the kitchen, trying to get ready but always being drawn back to bed. smiles and giggles and exploring a new city through your eyes and seeing your home and the alleys you used to smoke in and meeting your family. the bubble.',
  },
  {
    side: 'B',
    number: 3,
    title: 'LOVEBUG',
    songSrc: '/songs/ytmp3free.cc_jonas-brothers-lovebug-audio-youtubemp3free.org.mp3',
    description:
      '"I never thought that I\'d catch this lovebug again"\n\nFor me it was a case of thinking I\'d never catch it at all. You proved me wrong. The song that I listen to and makes me think of all the good ways you make me feel, the one im thinking of when I look at you and say "the typa shit they write songs about". head over heels.',
  },
  {
    side: 'B',
    number: 4,
    title: 'BENNIE AND THE JETS',
    songSrc: '/songs/ytmp3free.cc_bennie-and-the-jets-youtubemp3free.org.mp3',
    description:
      'singing in the shower, knowing almost none of the songs, with the shower head or my toothbrush as a microphone, hitting notes only audible by dogs. this song is happiness and joy and excitement and giddiness around you, it\'s the feeling that I can be myself and always have been able to with you. it\'s love.',
  },
]

function DescriptionParagraphs({ text }) {
  if (!text || !text.trim()) return null
  const parts = []
  let rest = text
  let key = 0
  while (rest.length) {
    const open = rest.indexOf('"')
    if (open === -1) {
      if (rest.trim()) parts.push({ type: 'normal', content: rest.trim(), key: key++ })
      break
    }
    const before = rest.slice(0, open).trim()
    if (before) parts.push({ type: 'normal', content: before, key: key++ })
    const close = rest.indexOf('"', open + 1)
    if (close === -1) {
      if (rest.slice(open).trim()) parts.push({ type: 'normal', content: rest.slice(open), key: key++ })
      break
    }
    const quoted = rest.slice(open + 1, close).trim()
    if (quoted) parts.push({ type: 'quote', content: quoted, key: key++ })
    rest = rest.slice(close + 1)
  }
  return (
    <div className="track-listing__description">
      {parts.map((p) =>
        p.type === 'quote' ? (
          <p key={p.key} className="track-listing__quote">
            {p.content.split('\n').map((line, i) => (
              <span key={i}>
                {line}
                {i < p.content.split('\n').length - 1 && <br />}
              </span>
            ))}
          </p>
        ) : (
          p.content.split(/\n\n+/).map((para, i) =>
            para.trim() ? (
              <p key={`${p.key}-${i}`} className="track-listing__body">
                {para.trim()}
              </p>
            ) : null
          )
        )
      )}
    </div>
  )
}

export function TrackListing() {
  const [index, setIndex] = useState(0)
  const [showFinalScreen, setShowFinalScreen] = useState(false)
  const audioRef = useRef(null)
  const track = TRACKS[index]

  const TRACK_START_OFFSET = 10

  useEffect(() => {
    if (showFinalScreen) return
    const el = audioRef.current
    if (!el || !track?.songSrc) return

    let cancelled = false

    el.pause()
    el.src = track.songSrc
    el.volume = 0.6

    const startPlayback = () => {
      if (cancelled) return
      el.currentTime = TRACK_START_OFFSET
      el.play().catch(() => {})
    }

    const onLoadedData = () => startPlayback()
    el.addEventListener('loadeddata', onLoadedData, { once: true })
    el.load()

    return () => {
      cancelled = true
      el.removeEventListener('loadeddata', onLoadedData)
      el.pause()
    }
  }, [index, track?.songSrc, showFinalScreen])

  const isLastTrack = index === TRACKS.length - 1

  const goPrev = () => setIndex((i) => (i <= 0 ? TRACKS.length - 1 : i - 1))
  const goNext = () => {
    if (isLastTrack) {
      const el = audioRef.current
      if (el) el.pause()
      setShowFinalScreen(true)
    } else {
      setIndex((i) => i + 1)
    }
  }

  if (showFinalScreen) {
    return (
      <div className="track-listing-final">
        <p className="track-listing-final__line">I love you, even from 10,214km away</p>
        <p className="track-listing-final__signature">Kawshie</p>
      </div>
    )
  }

  return (
    <div className="track-listing">
      <audio ref={audioRef} />
      <button type="button" className="track-listing__arrow track-listing__arrow--left" onClick={goPrev} aria-label="Previous track">
        &#9664;
      </button>
      <div className="track-listing__slide">
        <p className="track-listing__side">
          SIDE {track.side} &ndash; {track.number}
        </p>
        <h2 className="track-listing__title">{track.title}</h2>
        <DescriptionParagraphs text={track.description} />
      </div>
      <button type="button" className="track-listing__arrow track-listing__arrow--right" onClick={goNext} aria-label="Next track">
        &#9654;
      </button>
    </div>
  )
}
