clean:
	rm -rf ./dist

lint:
	yarn lint

test:
	yarn test

build:
	yarn build

publish:
	yarn publish --access public

release: clean lint test build publish