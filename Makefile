#
# Written by Volker Wiegand <volker@railduino.de>
#
# See https://github.com/railduino/zeroconf-lookup
#

all:   
	cd Firefox && zip -r -FS ../railduino-zeroconf-lookup.xpi *
	cd ..
	cd Chrome && zip -r -FS ../railduino-zeroconf-lookup.zip *

