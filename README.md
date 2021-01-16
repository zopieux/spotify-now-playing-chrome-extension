# Spotify Web "Now playing"

Install from the [Chrome Web Store](https://chrome.google.com/webstore/detail/khdkihdjbcgglfdjpbamhoahejlddkdj).

This Chrome extension keeps a JSON file on the local filesystem in sync with the current song on [Spotify Web](https://open.spotify.com).
This allows to pick up the changes to that file and display them in whatever fashion you fancy. See below for integration examples.

As opposed to other extensions such as [this one](https://github.com/orestes/spotify-web-watcher), no data is sent to a third-party. As legit as these might be, I don't want to unnecessarily depend on Firebase or other cloud providers just to retrieve some locally-available information.

The code is [short and simple](/src/content.js) and MIT licensed.

## Usage

1. [Install the extension](https://chrome.google.com/webstore/detail/khdkihdjbcgglfdjpbamhoahejlddkdj).
1. Open or reload [Spotify Web](https://open.spotify.com).
1. Click the green icon <img src="/logo.svg" width="16" height="16"> to pick the location of the JSON file.
1. The icon will disappear and the current song will immediately be written to the JSON file.
   Try skipping to another song: the file content is updated immediately.

## Written file format

```json
{
  "cover": "https://i.scdn.co/image/<some identifier>",
  "song": "The Song Name",
  "artist": "The Artist Name"
}
```

## Example: monitoring changes with `tail`

Note the `-F` flag instead of the commonly used `-f`. This is because Chrome uses an atomic rename when writing the file.

```bash
tail -F /tmp/now-playing.json
```

## Example: monitoring changes with `inotifywait` and `jq`

```bash
declare -r file=/tmp/now-playing.json
while true; do
    jq -r '"♫ " + .song + " – " + .artist' < "$file"
    # Chrome renames the file when writing, hence the "delete_self" event.
    inotifywait -q -e delete_self "$file" > /dev/null
done
```

Building on that example, here is a [Polybar](https://github.com/polybar/polybar/) module for showing the now-playing song:

```ini
[module/now-playing]
type = custom/script
tail = true
interval = 4
exec-if = test -f /tmp/now-playing.json
exec = while true; do jq -r '"♫ " + .song + " – " + .artist' < /tmp/now-playing.json && inotifywait -q -e delete_self /tmp/now-playing.json >/dev/null || exit 1; done
```

This achieves the following:

![screenshot](/screenshot.jpeg)

## License

MIT.
