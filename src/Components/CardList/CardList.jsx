import React, { useState, useEffect, useCallback } from 'react';
import debounce from 'lodash.debounce';

import useAPI from '../../API/useAPI'; /// тут API заменил на useAPI
import Spinner from '../UI/Spinner/Spinner';
import Error from '../UI/Error/Error';
import PaginationUI from '../UI/Pagination/PaginationUI';
import { APIConsumer } from '../../API-Context/API-Context';

import CardItem from './CardItem/CardItem';

import './CardList.scss';

const CardList = ({ query, guestId, tab }) => {
  const [movies, setMovies] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isError, setIsError] = useState(false);
  const [message, setMessage] = useState('Type to search...');
  const [currentPage, setCurrentPage] = useState(1);
  const [currentPageRated, setCurrentPageRated] = useState(1);
  const [totalItems, setTotalItems] = useState(0);
  const [ratingList, setRatingList] = useState([]);

  const api =  useAPI(); // тут API заменил на useAPI

  const onMoviesLoad = (movies) => {
    setMovies(movies);
    setIsLoading(false);
    setIsError(false);
  };

  const onError = () => {
    setIsError(true);
    setIsLoading(false);
  };

  const getMovies = (query = '', currentPage) => {
    if (query.length === 0) {
      setMessage('Type to search...');
    }
    api
      .getMoviesOnQuery(query, currentPage)
      .then((res) => {
        onMoviesLoad(res.results);
        setTotalItems(res.totalItems);
      })
      .catch(onError);
  };

  const getMoviesWithRating = (guestId, currentPage) => {
    api
      .getMoviesWithRating(guestId, currentPage)
      .then((res) => {
        onMoviesLoad(res.results);
        setTotalItems(res.totalItems);
      })
      .catch(onError);
  };

  const debounceGetMovies = useCallback(
    debounce((query, currentPage) => {
      setIsLoading(true);
      setMessage('We are very sorry, but we have not found anything...');
      getMovies(query, currentPage);
    }, 1500),
    []
  );

  const paginationOnChange = (page) => {
    if (tab === 'Search') {
      setCurrentPage(page);
    } else {
      setCurrentPageRated(page);
    }
  };

  const addRatedMovie = (id, value) => {
    const newRatedMovie = { id, value };
    setRatingList((prevRatingList) => [...prevRatingList, newRatedMovie]);
  };

  const removeRatedMovie = (id) => {
    setRatingList((prevRatingList) => prevRatingList.filter((item) => item.id !== id));
  };

  useEffect(() => {
    const storedRatingList = sessionStorage.getItem('ratingList');
    if (storedRatingList) {
      setRatingList(JSON.parse(storedRatingList));
    }
  }, []);

  useEffect(() => {
    if (tab === 'Rated') {
      setMessage('We are very sorry, but we have not found anything...');
      getMoviesWithRating(guestId, currentPageRated);
    }
    if (tab === 'Search') {
      setMessage('Type to search...');
      getMovies(query, currentPage);
    }
    sessionStorage.setItem('ratingList', JSON.stringify(ratingList));
  }, [query, currentPage, currentPageRated, tab, guestId, ratingList]);
  

  useEffect(() => {
    debounceGetMovies(query, currentPage);
  }, [query, currentPage, debounceGetMovies]);

  const errorView = isError ? <Error message="Oops. Something went wrong. Try again." type="error" /> : null;
  const spinner = isLoading && !isError ? <Spinner fontSize={60} /> : null;
  const current = tab === 'Search' ? currentPage : currentPageRated;

  const cardList = !isLoading && !isError ? (
    <CardListView
      movies={movies}
      message={message}
      current={current}
      onChange={paginationOnChange}
      totalItems={totalItems}
      guestId={guestId}
      addRatedMovie={addRatedMovie}
      removeRatedMovie={removeRatedMovie}
      ratingList={ratingList}
    />
  ) : null;

  return (
    <>
      {errorView}
      {spinner}
      {cardList}
    </>
  );
};

const CardListView = ({
  movies,
  message,
  current,
  onChange,
  totalItems,
  guestId,
  addRatedMovie,
  removeRatedMovie,
  ratingList,
}) => {
  return movies.length > 0 ? (
    <APIConsumer>
      {({ genres, postRating, deleteRating }) => (
        <>
          <ul className="card-list">
            {movies.map((movie) => {
              const rating = ratingList.find((item) => item.id === movie.id)?.value || undefined;
              return (
                <CardItem
                  key={movie.id}
                  movie={movie}
                  genresList={genres}
                  postRating={postRating}
                  deleteRating={deleteRating}
                  guestId={guestId}
                  addRatedMovie={addRatedMovie}
                  removeRatedMovie={removeRatedMovie}
                  rating={rating}
                />
              );
            })}
          </ul>
          <PaginationUI current={current} onChange={onChange} totalItems={totalItems} />
        </>
      )}
    </APIConsumer>
  ) : (
    <Error message={message} type="info" />
  );
};

export default CardList;
// вроде ок