// This file can be replaced during build by using the `fileReplacements` array.
// `ng build` replaces `environment.ts` with `environment.prod.ts`.
// The list of file replacements can be found in `angular.json`.

export const environment = {
  pdfViewerLinkTemplate: "https://psg4-word-view.officeapps.live.com/wv/WordViewer/request.pdf?type=printpdf&access_token=1&access_token_ttl=0&useNamedAction=1&WOPIsrc=http://psg4-view-wopi.wopi.online.office.net:808/oh/wopi/files/@/wFileId?wFileId=",
  production: false,
  apiBaseUrl: "http://localhost:3000/api/v1",
  oneSignalAppId: "f466c8d5-af8a-4281-97b6-3ea14453173c"
};

/*
 * For easier debugging in development mode, you can import the following file
 * to ignore zone related error stack frames such as `zone.run`, `zoneDelegate.invokeTask`.
 *
 * This import should be commented out in production mode because it will have a negative impact
 * on performance if an error is thrown.
 */
// import 'zone.js/plugins/zone-error';  // Included with Angular CLI.
