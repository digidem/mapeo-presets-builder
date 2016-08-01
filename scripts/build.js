var fs = require('fs-extra')
var path = require('path')
var mkdirp = require('mkdirp').sync
var glob = require('glob')
var YAML = require('js-yaml')
var _ = require('lodash')
var jsonschema = require('jsonschema')
//error handling here
var fieldSchema = require(path.join(process.cwd(), 'schema/field.json'))
var presetSchema = require(path.join(process.cwd(), 'schema/preset.json'))
var tar = require('tar-stream')


function readtxt (f) {
  return fs.readFileSync(f, 'utf8')
}

function read (f) {
  // console.log(f)
  return JSON.parse(readtxt(f))
}

function stringify (o) {
  return JSON.stringify(o, null, 4)
}

function validate (file, instance, schema) {
  var result = jsonschema.validate(instance, schema)
  if (result.length) {
    console.error(file + ': ')
    result.forEach(function (error) {
      if (error.property) {
        console.error(error.property + ' ' + error.message)
      } else {
        console.error(error)
      }
    })
    process.exit(1)
  }
}

function generateCategories () {
  return glob.sync(path.join(process.cwd(), 'categories/*.json')).reduce((categories, file) => {
    var field = read(file)
    var id = 'category-' + path.basename(file, '.json')
    categories[id] = field
    return categories
  }, {})
}

function generateFields () {
  return glob.sync(path.join(process.cwd(), 'fields/**/*.json')).reduce((fields, file) => {
    var field = read(file)
    var id = file.match(/fields\/([^.]*)\.json/)[1]
    validate(file, field, fieldSchema)
    fields[id] = field
    return fields
  }, {})
}

function categoryTranslations (categories) {
  return Object.keys(categories).reduce((p, id) => {
    p[id] = {name: categories[id].name}
    return p
  }, {})
}

function fieldTranslations (fields) {
  return Object.keys(fields).reduce((p, id) => {
    p[id] = {label: fields[id].label}
    if (fields[id].placeholder) {
      p[id].placeholder = fields[id].placeholder
    }
    if (fields[id].strings) {
      for (var i in fields[id].strings) {
        p[id][i] = fields[id].strings[i]
      }
    }
    return p
  }, {})
}

function presetsTranslations (presets) {
  return Object.keys(presets).reduce((p, id) => {
    p[id] = {
      name: presets[id].name,
      terms: (presets[id].terms || []).join(',')
    }
    return p
  }, {})
}

function generatePresets () {
  return glob.sync(path.join(process.cwd(), 'presets/**/*.json')).reduce((presets, file) => {
    var preset = read(file)
    var id = file.match(/presets\/([^.]*)\.json/)[1]
    validate(file, preset, presetSchema)
    presets[id] = preset
    return presets
  }, {})
}

function generateDefaults () {
  return read(path.join(process.cwd(),'defaults.json'))
}


exports.genPackage = function generatePackage (err, spriteFile, buildFolder) {
  if (err) return err
  var pack = tar.pack()

  var presets = {
    categories: generateCategories(),
    fields: generateFields(),
    presets: generatePresets(),
    defaults: generateDefaults()
  }

  var translations = {
    categories: categoryTranslations(presets.categories),
    fields: fieldTranslations(presets.fields),
    presets: presetsTranslations(presets.presets)
  }

  var presetsYaml = _.cloneDeep(translations)
  _.forEach(presetsYaml.presets, function (preset) {
    preset.terms = "<translate with synonyms or related terms for '" + preset.name + "', separated by commas>"
  })


  fs.readFile(spriteFile + '.css', (err, str) => {
    if (err) return err
    pack.entry({ name: 'icons.css' }, str)
  })
  fs.readFile(spriteFile + '.png', (err, str) => {
    if (err) return err
    pack.entry({ name: 'icons.png' }, str)
  })
  fs.readFile('region.css', (err, str) => {
    if (err) return err
    pack.entry({ name: 'region.css' }, str)
  })
  pack.entry({ name: 'presets.json' }, stringify(presets))
  pack.entry({ name: 'translations.json' }, stringify(translations))
  pack.entry({ name: 'presets.yaml' }, YAML.dump({es: {presets: presetsYaml}}))

  pack.pipe(fs.createWriteStream(path.join(buildFolder,'presets.mapeopresets')))
}
