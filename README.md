## Hexo S3 deploy script

As used by the Meteor guide.

### Install

```bash
$ npm install --save-dev hexo-s3-deploy
# or
$ yarn add hexo-s3-deploy --dev
```

### Add a command

(in `package.json`):

```
"scripts": {
  "deploy": "hexo-s3-deploy"
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
