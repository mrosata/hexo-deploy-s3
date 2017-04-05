#!/usr/bin/env node

var fs = require('fs')
var path = require('path')
var exec = require('child_process').exec
var s3sync = require('s3-sync')
var readdirp = require('readdirp')
var yaml = require('js-yaml')

var configYaml = fs.readFileSync('_config.yml', 'utf-8')
var config

var s3Options = {
  key: process.env.AWS_KEY,
  secret: process.env.AWS_SECRET,
  bucket: process.env.AWS_BUCKET,
  region: process.env.AWS_REGION || 'us-east-1'
}

if (!(s3Options.key && s3Options.secret)) {

  try {
    config = JSON.parse(
      fs.readFileSync(
        'keys.json', 'utf-8'))

    s3Options.key = config.key
    s3Options.secret = config.secret
    // If bucket isn't set in keys.json try to use s3Options.bucket
    s3Options.bucket = config.bucket || s3Options.bucket
    s3Options.region = config.region || 'us-east-1'


    if (!(s3Options.key && s3Options.secret && s3Options.bucket)) {
      throw new Error('keys.json was missing value for "' + Object.keys(s3Options).filter(function(key) {
        return !s3Options[key];
      }).join('", "') + '"')
    }
  } catch (err) {
    console.warn(
      'You must provide the AWS keys as either env vars or in keys.json.\n' + err.message
    )
    process.exit(1)
  }
}

getGitBranch()
  .then(getPrefix)
  .then(updateHexoConfig)
  .then(generateSite)
  .then(deployToS3)
  .catch(function (err) {
    console.warn(err)
    // Exit with an error code so deploy fails.
    process.exit(1)
  })

function getGitBranch () {
  return new Promise(function (resolve, reject) {
    exec('git status', function (err, out) {
      if (err) return reject(err)
      var branch = out.toString().match(/^On branch (.+)/)[1]

      var match;
      if (branch === 'master') {
        resolve('')
      } else if (match = branch.match(/^version-(.*)/)) {
        resolve('v' + match[1])
      } else if (match = branch.match(/^translation-(.*)/)){
        resolve(match[1])
      } else {
        resolve('branch-' + branch);
      }
    })
  })
}

function getPrefix(branch) {
  var root = yaml.load(configYaml).root.replace(/\//g, '')
  var parts = []
  if (branch) {
    parts.push(branch)
  }
  if (root) {
    parts.push(root)
  }
  // either '', 'branch', 'root', or 'branch/root'
  return parts.join('/')
}

function updateHexoConfig (prefix) {
  if (!prefix) {
    return Promise.resolve(prefix)
  } else {
    console.log('Updating hexo config...')
    return new Promise(function (resolve, reject) {
      var content = configYaml
        .replace('\nroot: .*\n', 'root: /' + prefix + '/')
      fs.writeFile('_config.yml', content, function (err) {
        if (err) return reject(err)
        console.log('done.')
        resolve(prefix)
      })
    })
  }
}

function generateSite (prefix) {
  console.log('Generating static site...')
  return new Promise(function (resolve, reject) {
    exec('hexo generate', function (err) {
      if (err) return reject(err)
      console.log('done.')
      resolve(prefix)
    })
  })
}

function deployToS3 (prefix) {
  var publicDir = yaml.load(configYaml).public_dir || 'public'
  s3Options.prefix = prefix ? prefix + '/' : ''
  console.log('deploying to S3 at "' + s3Options.prefix + '"...')
  var fileOptions = { root: publicDir }
  return readdirp(fileOptions)
    .pipe(s3sync(s3Options).on('data', function(file) {
      console.log(file.path + ' -> ' + file.url)
    }).on('end', function() {
      console.log('All done!')
    }))
}
