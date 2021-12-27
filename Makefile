npm-install:
	npm install
build:
	make npm-install
	npm run translation
