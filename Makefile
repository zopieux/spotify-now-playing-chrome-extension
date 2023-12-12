SRCS = src/manifest.json src/content.js
LOGO = "logo.png"
ICONS = $(addprefix src/icon-,$(addsuffix .png,16 32 48 128))
ZIP =  spotify-now-playing.zip

all: $(ZIP)

src/icon-%.png: logo.png
	convert "$<" -resize $*x "$@"

$(ZIP): $(SRCS) $(ICONS)
	zip -r $@ $(SRCS) $(ICONS)

clean:
	rm -f $(ICONS) $(ZIP)
