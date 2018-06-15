import View from './newTab/View';
import dayjs from 'dayjs';
import country_list from 'country-list';
import countryByLifeExpectancy from '../../lifeData/country-by-life-expectancy.json';
import { $ } from '../js/helpers/helper';
import Model from './newTab/Model';
import { request } from 'http';

// import Unsplash, { toJson } from 'unsplash-js';
// import UnsplashHandler from './main/UnsplashHandler';

const view = new View();
const model = new Model();
class App {
  constructor($el) {
    this.$el = $el;
    // model.clearSyncStorage().then(() => {
    model.getSyncStorageByKeys([`country`, `birth`]).then(syncData => {
      console.log('---------');
      console.log(syncData);
      console.log('---------');
      const { country, birth } = syncData;
      if (country && birth) {
        this.country = country;
        this.birth = birth;
        this.showFinalPage();
      } else {
        this.showDetectedCountryPage();
      }
    });
    // });
  }

  showFinalPage() {
    const lifeExpectancy = countryByLifeExpectancy.find(elem => elem.country === this.country).expectancy;
    const oneYearSeconds = 365 * 24 * 60 * 60;
    const birthSec = Math.floor(new Date(this.birth).getTime() / 1000);
    const dieSec = birthSec + lifeExpectancy * oneYearSeconds;

    const updateRemainingYear = () => {
      const nowSec = Math.floor(new Date().getTime() / 1000);
      const remainingSec = dieSec - nowSec;
      let remainingYear = remainingSec / oneYearSeconds;
      remainingYear = remainingYear.toFixed(9).split(`.`);

      view.renderTemplate(`final`, {
        remainingYear0: remainingYear[0],
        remainingYear1: remainingYear[1],
      });

      requestAnimationFrame(updateRemainingYear);
    };

    // requestAnimationFrame(updateRemainingYear);
    setInterval(updateRemainingYear, 100);
  }

  renderAge() {
    var now = new Date();
    var duration = now - this.birth;
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

  showBirthPage() {
    const todayYYYYMMDD = dayjs().format('YYYY-MM-DD');
    view.renderTemplate('birth', { today: todayYYYYMMDD });

    this.listenElement(`submitBirth`, `click`);

    // for test
    $(`birthInput`).value = `1993-01-01`;
  }

  /**
   * 用來對 Element addEventListener 用的，
   * lister 固定名稱是 `${eventType}_${id}_listener`
   *
   * @param {string} id
   * @param {string} eventType
   * @memberof App
   */
  listenElement(id, eventType) {
    $(id).addEventListener(`click`, this[`${eventType}_${id}_listener`].bind(this));
  }

  click_submitBirth_listener(e) {
    e.preventDefault();

    const birthInputValue = $(`birthInput`).value;
    if (birthInputValue) {
      this.birth = birthInputValue;
      model.setSyncStorage({ birth: birthInputValue }).then(() => {
        console.log('---------');
        console.log(`set ${birthInputValue} success`);
        console.log('---------');
      });
      this.showFinalPage();
    }
  }

  showDetectedCountryPage() {
    this.getCountryByAPI();
    view.renderTemplate('country');
  }

  getCountryByAPI() {
    fetch(`http://ip-api.com/json`)
      .then(data => data.json())
      .then(json => {
        this.showDetectedCountryText(json.country);
      })
      .catch(error => {
        console.log('---------');
        console.log(`getCountryByAPI() error`, error);
        console.log('---------');
        this.getCountryByNavigator();
      });
  }

  getCountryByNavigator() {
    navigator.geolocation.getCurrentPosition(data => {
      const { latitude, longitude } = data.coords;
      const latlng = `${latitude},${longitude}`;
      fetch(`https://maps.googleapis.com/maps/api/geocode/json?latlng=${latlng}`)
        .then(res => res.json())
        .then(json => {
          const results = json.results;
          const countryLongName = results[results.length - 1].formatted_address;
          this.showDetectedCountryText(countryLongName);
        })
        .catch(error => {
          console.log('--------');
          console.log(`getCountryByNavigator() error`, error);
          console.log('--------');
          this.showPickCountryPage();
        });
    });
  }

  showDetectedCountryText(countryName) {
    this.country = countryName;
    $(`detectedCountry`).textContent = countryName;

    this.listenElement(`detectedCountryYes`, `click`);
    this.listenElement(`detectedCountryNo`, `click`);
  }

  click_detectedCountryYes_listener(e) {
    e.preventDefault();
    model.setSyncStorage({ country: this.country }).then(() => {
      console.log('---------');
      console.log(`set ${this.country} success`);
      console.log('---------');
      this.showBirthPage();
    });
  }

  click_detectedCountryNo_listener(e) {
    e.preventDefault();
    this.showPickCountryPage();
  }

  showPickCountryPage() {
    view.renderTemplate('pickCountry', {
      countries: countryByLifeExpectancy.map(elem => elem.country).sort(),
    });
    this.listenElement(`submitCountry`, `click`);
  }

  click_submitCountry_listener(e) {
    e.preventDefault();
    const countrySelectValue = $(`countrySelect`).value;
    this.country = countrySelectValue;
    model.setSyncStorage({ country: countrySelectValue }).then(() => {
      console.log('--------');
      console.log(`set country ${countrySelectValue}`);
      console.log('--------');
    });
    this.showBirthPage();
  }
}

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

window.app = new App($('app'));
