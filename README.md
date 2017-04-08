## Hexo Deploy S3 Script

Easily deploy static Hexo site to AWS S3. Uses environment variables or a
`keys.json` file with configuration. The script runs independent of Hexo, but
it uses the Hexo for generating the static site and looking up som
configurations.
Originally forked from 'meteor/hexo-s3-deploy'

### Install

```bash
$ npm install --save-dev hexo-deploy-s3
# or
$ yarn add hexo-deploy-s3 --dev
```

### Add a command

(in `package.json`):

```
"scripts": {
  "deploy": "hexo-deploy-s3"
}
```

### Run command

Set the env vars, there is a fourth variable `AWS_REGION` that defaults to `'us-east-1'`.

```
AWS_KEY
AWS_SECRET
AWS_BUCKET
```

or create a file `keys.json` with `key`, `secret`, and `bucket` in the root project folder. Optionally use a `region` property as well, defaults to `'us-east-1'`. (note: this was previously done in the folder for this module, but it would be safer in the actual root folder of your project). You should add keys.json to your .gitignore file if using this method.

```json
{
  "key": "---- aws key here ----",
  "secret": "---- aws secret here ----",
  "bucket": "---- aws bucket here ----"
}
```


Then:

```sh
  $ npm run deploy
  # or...
  $ yarn deploy
```

