SRCS = src/manifest.json src/content.js
LOGO = logo.svg
ICONS = $(addprefix src/icon-,$(addsuffix .png,16 32 48 128))
ZIP =  spotify-now-playing.zip

all: $(ZIP)

src/icon-%.png: logo.svg
	inkscape -w $* -h $* -o $@ $<

$(ZIP): $(SRCS) $(ICONS)
	rm -f $@
	zip -r $@ src/
