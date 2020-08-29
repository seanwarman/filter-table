# Uploader

Creates a small uploader component that accepts docs and urls.

```js
<Uploader
  uploads={() => {
    return this.props.getUploads()
  }}
  saveUrl={this.handleSaveUrl}
  saveUpload={this.handleSaveUpload}
></Uploader>
```

## uploads

Accepts a function that returns a promise. The uploads will 
need to be in the format of the `bms_booking.uploads` records.
With an added concatted `uploadedUserName` column made of the `firstName`
and `lastName` fields.

Here's a jseq query you can use with it.

```js
{
  name: 'Biggly.uploads',
  columns: [
    {name: 'uploadsKey'},
    {name: 'created'},
    {name: 'uploadedUserKey'},
    {name: 'Biggly.users', columns: [
      {name: 'concat=>(firstName " " lastName)', as: 'uploadedUserName'}
    ], where: [
      'uploads.uploadedUserKey = users.userKey'
    ]},
    {name: 'fileName'},
    {name: 'bookingsKey'},
    {name: 'urlName'},
    {name: 'updated'},
    {name: 'campaignKey'},
    {name: 'customerKey'},
  ]
}
```

## saveUrl

Accepts a function with the Uploader's `state` as the arg.
This function awaits a result which will tell the loading
icon to stop so you have to return something in this function.

```js
handleSaveUrl = async uploaderState => {
  // Do stuff with uploaderState...
  // ...
  
  // ...later on
  return result
}
```

## saveUpload

Also accepts a function with the Uploader's `state` as the arg.
The difference here is the `state` will have a `file` object 
you can use to upload the given file.

This function also expects a returned result.

```js
handleSaveUpload = async uploaderState => {
  let s3UrlName
  let s3Url = 'https://s3-eu-west-1.amazonaws.com/bms-console-services/public/'

  try {
    s3UrlName = await s3Upload(uploaderState.file)
  } catch (err) {
    console.log('There was an error uploading to the s3: ', err)
  }

  // ...etc

  // ...then return a result
  return result
}
```
