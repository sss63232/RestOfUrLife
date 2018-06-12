import Handlebars from './3rd/handlebars';
import country_list from 'country-list';
import lifeData from './life.json';

// import Unsplash, { toJson } from 'unsplash-js';
// import UnsplashHandler from './main/UnsplashHandler';

class App {
  constructor($el) {
    this.$el = $el;
    this.load();

    this.$el.addEventListener(`submit`, this.submit.bind(this));

    if (this.dateOfBirth) {
      this.renderAgeLoop();
    } else {
      this.renderChoose();
    }
  }

  load() {
    var value;

    if ((value = localStorage.dateOfBirth)) this.dateOfBirth = new Date(parseInt(value));
  }

  save() {
    if (this.dateOfBirth) localStorage.dateOfBirth = this.dateOfBirth.getTime();
  }

  submit(e) {
    e.preventDefault();

    var input = this.$$('input')[0];
    if (!input.valueAsDate) return;

    this.dateOfBirth = input.valueAsDate;
    this.save();
    this.renderAgeLoop();
  }

  renderChoose() {
    this.html(this.view('dob')());
  }

  renderAgeLoop() {
    this.interval = setInterval(this.renderAge.bind(this), 100);
  }

  renderAge() {
    var now = new Date();
    var duration = now - this.dateOfBirth;
    var years = duration / 31556900000;

    var majorMinor = years
      .toFixed(9)
      .toString()
      .split('.');

    requestAnimationFrame(
      function() {
        this.html(
          this.view('age')({
            year: majorMinor[0],
            milliseconds: majorMinor[1],
          })
        );
      }.bind(this)
    );
  }

  $$(sel) {
    return this.$el.querySelectorAll(sel);
  }

  html(html) {
    this.$el.innerHTML = html;
  }

  view(name) {
    var $ = document.getElementById.bind(document);
    var $el = $(name + '-template');
    return Handlebars.compile($el.innerHTML);
  }
}

// const countries = country_list();
// console.log(lifeData.filter(data => data.country === `Iceland`));

let location;

// navigator.geolocation.getCurrentPosition(data => {
//   const { latitude, longitude } = data.coords;
//   let latlng = `${latitude},${longitude}`;
//   fetch(`https://maps.googleapis.com/maps/api/geocode/json?latlng=${latlng}`)
//     .then(res => res.json())
//     .then(json => {
//       const results = json.results;
//       const countryLongName = results[results.length - 1].formatted_address;
//       console.log('---------');
//       console.log(countryLongName);
//       console.log('---------');
//     });
// });

// fetch(`http://ip-api.com/json`)
//   .then(data => data.json())
//   .then(json => {
//     console.log('---------');
//     console.log(json.country);
//     console.log(json.countryCode);
//     console.log('---------');
//   })
//   .catch(error => {
//     console.log('--------');
//     console.log(error);
//     console.log('--------');
//   });

// const unsplashInstance = new Unsplash({
//   applicationId: 'de67f1ba6f631670eedefff4c31bc09c840310d39a12d6785c1eb0f06fb7146f',
//   secret: '6e563cd7a8569dca86a605c7266e668d12c820a4568ca9eea254ff379df3004b',
//   callbackURL: 'urn:ietf:wg:oauth:2.0:oob',
// });

let innerW = window.innerWidth;
let innerH = window.innerHeight;

// unsplashInstance.photos
//   .getRandomPhoto({
//     width: innerW,
//     height: innerH,
//     query: `spring`,
//     featured: true,
//   })
//   .then(toJson)
//   .then(json => {
//     let style = document.getElementsByTagName('body')[0].style;
//     style.backgroundImage = `url('${json.urls.custom}')`;
//   });

const $ = document.getElementById.bind(document);
const $$ = document.querySelectorAll.bind(document);

window.app = new App($('app'));
