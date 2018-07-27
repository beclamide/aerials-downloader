const fs = require('fs');
const rimraf = require('rimraf');
const request = require('request');
const progress = require('request-progress');
const ProgressBar = require('progress');

const downloadFolder = './videos';

async function start() {
    await makeFolder();
    
    let videos = await getJSON();
    for (const video of videos) await download(video);
    
    console.log('Finished!');
}

function makeFolder() {
  return new Promise(resolve => {
    fs.mkdir(downloadFolder, resolve(true));
  });
}

function getJSON() {
    return new Promise(resolve => {
        request('http://a1.phobos.apple.com/us/r1000/000/Features/atv/AutumnResources/videos/entries.json', (err, response, body) => {
            if (err) throw(err);
            
            let videos = JSON.parse(body);
            videos = videos.map(v => v.assets);
            videos = [].concat(...videos);
            
            resolve(videos);
        })
    })
}

function download(video) {
  return new Promise(resolve => {
    console.log();
    console.log(`${video.accessibilityLabel} ${video.id}...`);

    var bar;

    progress(request('http://a1.phobos.apple.com/us/r1000/000/Features/atv/AutumnResources/videos/comp_GL_G004_C010_v03_6Mbps.mov'))
      .on('progress', state => {
        if (!bar) {
          bar = new ProgressBar('  downloading [:bar] :rate/bps :percent :etas', {
            complete: '=',
            incomplete: ' ',
            width: 20,
            total: state.size.total
          });
        } else {
          bar.update(state.percent);
        }
      })
      .pipe(
        fs.createWriteStream(`${downloadFolder}/${video.accessibilityLabel}__${video.id}.mp4`)
        .on('finish', () => {
          bar.update(100);
          resolve(true);
        })
      )
  })
}

rimraf(downloadFolder, start);