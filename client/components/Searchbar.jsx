import React, {Component} from 'react'
import ShowSearchResults from './ShowSearchResults.jsx'
import history from '../history'
import {getSocrataCategories, searchSocrataForDatasets} from '../componentUtils'

export default class SearchBar extends Component {
  constructor(props) {
    super(props)

    this.state = {
      results: [],
      search: '',
      showResults: false,
      submittedSearch: '',
      searchCategories: [],
      filter: 'no filter'
    }

    this.handleChange = this.handleChange.bind(this)
    this.handleFilter = this.handleFilter.bind(this)
    this.handleSubmit = this.handleSubmit.bind(this)
  }

  componentDidMount() {
    const {search} = this.props.location
    const queryIndex = search.indexOf('?query=')
    const filterIndex = search.indexOf('&filter=')
    let filter = 'no filter'
    let searchbar = ''
    let end = filterIndex === -1 ? search.length : filterIndex
    if (queryIndex !== -1) {
      searchbar = search.slice(queryIndex + 7, end).replace(/%20/g, ' ')
    }
    if (filterIndex !== -1) {
      filter = search.slice(filterIndex + 8).replace(/%20/g, ' ')
    }
    getSocrataCategories()
      .then(categories => {
        let setFilter = categories.includes(filter) ? filter : 'no filter'
        this.setState({
          search: searchbar,
          searchCategories: categories,
          filter: setFilter
        })
        if (queryIndex !== -1 || filterIndex !== -1) {
          document.getElementById('search-button').click()
        }
      })
      .catch(console.error)
  }

  handleChange(event) {
    const search = event.target.value
    this.setState({search})
  }

  handleFilter(event) {
    const filter = event.target.value
    this.setState({filter})
  }

  handleSubmit(event) {
    event.preventDefault()
    const {search} = this.state
    const filter = this.state.filter === 'no filter' ? '' : this.state.filter
    searchSocrataForDatasets(search, filter)
      .then(results => {
        this.setState({results, showResults: true, submittedSearch: search})
        history.push(`/search?query=${search}&filter=${filter}`)
      })
      .catch(console.error)
  }

  render() {
    const {results, submittedSearch, searchCategories} = this.state
    return (
      <div>
        <h2 id="searchbar-name">Search among more than 10,000 datasets</h2>
        <form onSubmit={this.handleSubmit}>
          <input
            placeholder="Search Dataset"
            className="searchbar-input"
            onChange={this.handleChange}
            name="searchbar"
            value={this.state.search}
          />
          <div className="searchbar-select">
            {searchCategories.length > 0 && (
              <select onChange={this.handleFilter} value={this.state.filter}>
                <option hidden value="no filter">
                  Select Category
                </option>
                {searchCategories.map(category => (
                  <option value={category} key={category}>
                    {category}
                  </option>
                ))}
              </select>
            )}
            <button type="submit" id="search-button">
              Search
            </button>
          </div>
        </form>
        <br />
        <div className="searches">
          {this.state.showResults && (
            <ShowSearchResults results={results} search={submittedSearch} />
          )}
        </div>
      </div>
    )
  }
}
