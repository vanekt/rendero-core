clean:
	rm -rf ./dist

lint:
	yarn lint

build:
	yarn build

publish:
	yarn publish

release: clean lint build publish