import SimpleLightbox from 'simplelightbox';
import 'simplelightbox/dist/simple-lightbox.min.css';
import Notiflix from 'notiflix';

import { fetchImages } from './js/fetchImages';

const searchQuery = document.querySelector('input');
const closeBtn = document.querySelector('.close-btn');
const searchForm = document.querySelector('#search-form');
const gallery = document.querySelector('.gallery');
const loadBtn = document.querySelector('.load-more');

document.querySelector('#search-box').placeholder = 'Search images...';

let lightbox = new SimpleLightbox('.gallery a', {
  captions: true,
  captionsData: 'alt',
  captionDelay: 250,
});

let perPage = 40;
let page = 0;
let name = searchQuery.value;

loadBtn.style.display = 'none';
closeBtn.style.display = 'none';

async function eventHandler(e) {
  e.preventDefault();
  gallery.innerHTML = '';
  loadBtn.style.display = 'none';

  page = 1;
  name = searchQuery.value.trim();

  if (name === '') {
    gallery.innerHTML = '';
    return Notiflix.Notify.failure(
      'Sorry, there are no images matching your search query. Please try again.'
    );
  }

  try {
    const nameOf = await fetchImages(name, page, perPage);
    const totalPages = nameOf.totalHits / perPage;

    if (totalPages >= 1 && totalPages < 40) {
      renderGallery(nameOf);
      lightbox.refresh();
      loadBtn.style.display = 'block';
      closeBtn.style.display = 'block';
      closeBtn.addEventListener('click', () => {
        gallery.innerHTML = '';
        closeBtn.style.display = 'none';
      });
      Notiflix.Notify.success(`Hooray! We found ${nameOf.totalHits} image.`);
    }else if (nameOf.hits.length === 0) {
      Notiflix.Notify.failure(
        'Sorry, there are no images matching your search query. Please try again.'
      );
    } else if (totalPages <= page) {
      loadBtn.style.display = 'none';
      Notiflix.Notify.failure(
        "We're sorry, but you've reached the end of search results."
      );
    }
    renderGallery(nameOf);

    lightbox.refresh();
  } catch (error) {
    console.log(error);
  }
}

searchForm.addEventListener('submit', eventHandler);

function renderGallery(nameOf) {
  const markup = nameOf.hits
    .map(hit => {
      return `<div class="photo-card">
        <a class="gallery-item" href="${hit.largeImageURL}">
          <img
            class="gallery__image"
            src="${hit.webformatURL}"
            alt="${hit.tags}"
            loading="lazy"
        /></a>
        <div class="info">
          <div class="info__box">
            <p class="info-item">
              <b class="material-symbols-outlined">thumb_up</b>
            </p>
            <p class="info-counter">${hit.likes.toLocaleString()}</p>
          </div>
          <div class="info__box">
            <p class="info-item">
              <b class="material-symbols-outlined">visibility</b>
            </p>
            <p class="info-counter">${hit.views.toLocaleString()}</p>
          </div>
          <div class="info__box">
            <p class="info-item">
              <b class="material-symbols-outlined">forum</b>
            </p>
            <p class="info-counter">${hit.comments.toLocaleString()}</p>
          </div>
          <div class="info__box">
            <p class="info-item">
              <b class="material-symbols-outlined">download</b>
            </p>
            <p class="info-counter">${hit.downloads.toLocaleString()}</p>
          </div>
        </div>
      </div>`;
    })
    .join('');
  gallery.insertAdjacentHTML('beforeend', markup);
}

loadBtn.addEventListener(
  'click',
  async () => {
    name = searchQuery.value;
    page += 1;
    const nameOf = await fetchImages(name, page, perPage);
    const totalPages = nameOf.totalHits / perPage;
    renderGallery(nameOf);
    lightbox.refresh();
    if (page >= totalPages) {
      loadBtn.style.display = 'none';
      Notiflix.Notify.info(
        "We're sorry, but you've reached the end of search results."
      );
    }
  },
  true
);
