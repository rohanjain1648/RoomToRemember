// RoomToRememberAudio — all sound playback for Room to Remember.
// Owns: the WAV references, per-spot spatial AudioComponents (so hints/chimes come from the
//       object's exact spot), and one non-spatial UI channel.
// Expects: Main calls attachSpot(i, sceneObject) once per item spot, then play* helpers.
// Must not: decide when sounds play (Main does) or touch UI.

const CLIPS: { [key: string]: AudioTrackAsset } = {
  Sniff: requireAsset("../GeneratedSFX/Sniff.wav") as AudioTrackAsset,
  Shutter: requireAsset("../GeneratedSFX/Shutter.wav") as AudioTrackAsset,
  Vroom: requireAsset("../GeneratedSFX/Vroom.wav") as AudioTrackAsset,
  RopeSqueak: requireAsset("../GeneratedSFX/RopeSqueak.wav") as AudioTrackAsset,
  ThreeNotes: requireAsset("../GeneratedSFX/ThreeNotes.wav") as AudioTrackAsset,
  UfoBeam: requireAsset("../GeneratedSFX/UfoBeam.wav") as AudioTrackAsset,
  PlacePop: requireAsset("../GeneratedSFX/PlacePop.wav") as AudioTrackAsset,
  ButtonClick: requireAsset("../GeneratedSFX/ButtonClick.wav") as AudioTrackAsset,
  NextChime: requireAsset("../GeneratedSFX/NextChime.wav") as AudioTrackAsset,
  AllPlacedChime: requireAsset("../GeneratedSFX/AllPlacedChime.wav") as AudioTrackAsset,
  LapDone: requireAsset("../GeneratedSFX/LapDone.wav") as AudioTrackAsset,
  Sparkle: requireAsset("../GeneratedSFX/Sparkle.wav") as AudioTrackAsset,
}

export class RoomToRememberAudio {
  private voice: AudioComponent[] = []   // the item's own sound, from its spot
  private fx: AudioComponent[] = []      // pop / chime / sparkle, from the same spot
  private ui: AudioComponent

  /** Last clip key played per channel — read by tests and debug logs. */
  lastPlayed: string = ""
  lastPlayedSpot: number = -1

  constructor(private host: SceneObject, private sfxVolume: number, private louderVolume: number) {
    this.ui = this.makeComponent(host, false)
  }

  attachSpot(index: number, spot: SceneObject): void {
    this.voice[index] = this.makeComponent(spot, true)
    this.fx[index] = this.makeComponent(spot, true)
  }

  playItemSound(index: number, key: string, louder: boolean): void {
    this.playOn(this.voice[index], key, louder ? this.louderVolume : this.sfxVolume, index)
  }

  playAtSpot(index: number, key: string): void {
    this.playOn(this.fx[index], key, this.sfxVolume, index)
  }

  playUi(key: string): void {
    this.playOn(this.ui, key, this.sfxVolume, -1)
  }

  private playOn(ac: AudioComponent | undefined, key: string, volume: number, spot: number): void {
    const clip = CLIPS[key]
    if (!ac || !clip) {
      print(`RoomToRememberAudio: missing channel or clip '${key}'`)
      return
    }
    if (ac.isPlaying()) ac.stop(false)
    ac.audioTrack = clip
    ac.volume = volume
    ac.play(1)
    this.lastPlayed = key
    this.lastPlayedSpot = spot
  }

  private makeComponent(owner: SceneObject, spatial: boolean): AudioComponent {
    const ac = owner.createComponent("Component.AudioComponent") as AudioComponent
    ac.playbackMode = Audio.PlaybackMode.LowLatency   // input-reactive cues
    if (spatial) {
      ac.spatialAudio.enabled = true
      ac.spatialAudio.positionEffect.enabled = true
      ac.spatialAudio.distanceEffect.enabled = true
      ac.spatialAudio.distanceEffect.minDistance = 50
      ac.spatialAudio.distanceEffect.maxDistance = 1500
    }
    return ac
  }
}
