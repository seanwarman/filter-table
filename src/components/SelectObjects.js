import React, { PureComponent } from 'react'

import './SelectObjects.css'

function guidgenerator() {
    var S4 = function() {
       return (((1+Math.random())*0x10000)|0).toString(16).substring(1);
    };
    return (S4()+S4()+"-"+S4()+"-"+S4()+"-"+S4()+"-"+S4()+S4()+S4());
}

function filterBySearchTerm({searchTerm, labelIndex, dataSource}) {
  if(!searchTerm || (searchTerm || '').length === 0) return dataSource

  const termRegx = RegExp(searchTerm, 'gi')

  return dataSource.filter(record => termRegx.test(record[labelIndex]))
}

function menuStyles(menuOpen) {
  return menuOpen ? 'show' : 'hide'
}


function inputValOrSearchTerm({data, editing, labelIndex, searchTerm}) {
  return (
    data && !editing ?
    (data || {})[labelIndex]
    :
    searchTerm
  )
}

function checkDataIndex(data, record, dataIndex) {
  data.forEach(item => {
    if(!item[dataIndex]) throw Error(dataIndex + ' cannot be found on the data records of SelectObjects')
  })

  if(!record[dataIndex]) throw Error(dataIndex + ' cannot be found on the dataSource records of SelectObjects')

}

function filterSelectedRecordFromValues({
  data, 
  record,
  dataIndex
}) {
  checkDataIndex(data, record, dataIndex)

  return data.filter(obj => obj[dataIndex] !== record[dataIndex])

}

function checkThisTagSelected({
  data,
  record,
  dataIndex,
}) {

  checkDataIndex(data, record, dataIndex)

  if(data.find(obj => obj[dataIndex] === record[dataIndex])) return true
  return false

}

function SingleSelector({labelIndex, dataSource, onChange, menuStyles, data}) {
  return (

    <div className={`checkbox-menu-scroll ${menuStyles}`}
      // style={menuStyles}
    >
      {
        dataSource.map((record, i) => (
          <div 
            className="checkbox-group-single-wrapper row"
            key={i}
            style={{
              fontWeight: (data || {})[labelIndex] === record[labelIndex] ? '600' : 'unset'
            }}
            onClick={e => onChange(record, e)}
          >
            <label 
              className="ant-checkbox-wrapper"
            >
              <div>
                {record[labelIndex]}
              </div>
            </label>
          </div>
        ))
      }
    </div>
  )
}



function TagsSelecter({
  data,
  labelIndex, 
  dataIndex,
  dataSource, 
  onChangeCheckbox,
  componentId,
  menuStyles,
}) {
  return (
    <div className={`checkbox-menu-scroll ${menuStyles}`}>
      {
        dataSource.map((record, i) => (
          <div 
            className="row"
            key={i}
          >
            <label 
              className="ant-checkbox-wrapper"
              onChange={e => onChangeCheckbox({ e, record, i, dataIndex })}
              htmlFor={`record-checkbox-${componentId}-${i}`}
            >
              {record[labelIndex]}
              <input
                checked={checkThisTagSelected({ record, data, dataIndex })}
                className="ant-checkbox record-checkbox"
                onChange={() => {}}
                style={{ marginRight: 8 }}
                id={`record-checkbox-${componentId}-${i}`}
                type="checkbox"
              >
              </input>
              <span className="tick"></span>
            </label>
          </div>
        ))
      }
    </div>
  )
}


function RenderTags ({
  labelIndex,
  data,
  openMenu,
  dataIndex,
  onChangeCheckbox,
  inputStyles,
  menuOpen,
}) {
  return <div
    style={inputStyles}
    className="checkbox-input checkbox-group-search checkbox-group-tagslist"
    onClick={openMenu}
  >
    {
      data.length &&
        data.map((record, i) => (
          <div
            className="checkbox-tag"
            key={i}
          >
            {record[labelIndex]} 
            <span 
              className="checkbox-tag-cross"
              onClick={e => {
                e.stopPropagation()
                onChangeCheckbox({ e, record, i, dataIndex })
              }}
            > x</span>
          </div>
        ))
    }
  </div>
}

function RenderSearchBarAndTags({
  labelIndex,
  data,
  editing,
  placeholder,
  searchTerm,
  onSearch,
  openMenu,
  onChangeCheckbox,
  dataIndex,
  inputStyles,
  menuOpen,
}) { 
  return (
    data.length > 0 && !editing ?
    <RenderTags
      inputStyles={inputStyles}
      menuOpen={menuOpen}
      editing={editing}
      dataIndex={dataIndex}
      labelIndex={labelIndex}
      data={data}
      openMenu={openMenu}
      onChangeCheckbox={onChangeCheckbox}
    >
    </RenderTags>
    :
    <input
      style={inputStyles}
      type="input"
      onFocus={openMenu}
      className="checkbox-input checkbox-group-search"
      placeholder={placeholder || 'Search'}
      value={searchTerm}
      onChange={onSearch}
    >
    </input>
  )
}


function RenderSearchBarAndInput({
  data,
  placeholder,
  editing,
  searchTerm,
  labelIndex,
  openMenu,
  onSearch,
  inputStyles,
}) {
  return <input
    type="input"
    style={inputStyles}
    onFocus={openMenu}
    className="checkbox-input checkbox-group-search"
    placeholder={placeholder || 'Search'}
    value={inputValOrSearchTerm({data, editing, labelIndex, searchTerm})}
    onChange={onSearch}
  >
  </input>
}



class SelectObjects extends PureComponent {

  state = {
    menuOpen: false,
    editing: false,
    searchTerm: '',
  }

  inputStyles = style => ({
    ...style,
    zIndex: this.state.menuOpen ? 16 : 'unset'
  })

  dismissMenu = () => {
    this.setState({ menuOpen: false, editing: false })
  }

  openMenu = () => {
    this.setState({ menuOpen: true, editing: true })
  }

  onSearch = e => this.setState({searchTerm: e.target.value})


  onChangeCheckbox = ({
    data,
    onChange,
  }) => ({
    e, i, record, dataIndex
  }) => {

    const { checked } = e.target

    this.setState({editing: false})

    if(checked) {
      onChange([...filterSelectedRecordFromValues({
        data, 
        record,
        dataIndex,
      }), record])
    } else {
      onChange(filterSelectedRecordFromValues({
        data, 
        record,
        dataIndex,
      }))
    }

  }

  renderTagsSelect = ({
    labelIndex,
    dataSource,
    menuStyles,
    data,
    placeholder,
    openMenu,
    onChangeCheckbox,
    dataIndex,
    style,
  }) => {

    const componentId = guidgenerator()

    return <>
      <RenderSearchBarAndTags
        menuOpen={this.state.menuOpen}
        inputStyles={this.inputStyles(style)}
        dataIndex={dataIndex}
        editing={this.state.editing}
        searchTerm={this.state.searchTerm}
        onSearch={this.onSearch}
        openMenu={this.openMenu}
        labelIndex={labelIndex}
        onChangeCheckbox={onChangeCheckbox}
        data={data}
        placeholder={placeholder}
      >
      </RenderSearchBarAndTags>

      <TagsSelecter
        componentId={componentId}
        dataIndex={dataIndex}
        data={data}
        menuStyles={menuStyles}
        labelIndex={labelIndex}
        onChangeCheckbox={onChangeCheckbox}
        dataSource={filterBySearchTerm(
          {
            searchTerm: this.state.searchTerm || '', 
            labelIndex, 
            dataSource
          }
        )}
      >
      </TagsSelecter>

    </>
  }

  renderInputSelect = ({
    labelIndex,
    onChange,
    dataSource,
    menuStyles,
    data,
    onSearch,
    style,
  }) => (
    <>
      <RenderSearchBarAndInput
        inputStyles={this.inputStyles(style)}
        editing={this.state.editing}
        data={data}
        labelIndex={labelIndex}
        onChange={onChange}
        searchTerm={this.state.searchTerm}
        dataSource={dataSource}
        openMenu={this.openMenu}
        onSearch={this.onSearch}
      >
      </RenderSearchBarAndInput>

      <SingleSelector
        data={data}
        labelIndex={labelIndex}
        onChange={(record, e) => {
          this.setState({editing: false, menuOpen: false})
          onChange(record, e)
        }}
        menuStyles={menuStyles}
        dataSource={filterBySearchTerm(
          {
            searchTerm: this.state.searchTerm || '', 
            labelIndex,
            dataSource,
          }
        )}
      >
      </SingleSelector>
    </>
  )

  render() {
    return (
      <>
        {
          this.state.menuOpen &&
          <div
            onClick={this.dismissMenu}
            className="checkbox-group-background"
          ></div>
        }
        <div
          id={`checkbox-group`}
        >
          {
            this.props.tags ?
            this.renderTagsSelect({
              style:       this.props.style,
              dataIndex:   this.props.dataIndex,
              labelIndex:  this.props.labelIndex,
              dataSource:  this.props.dataSource,
              data:        this.props.data,
              placeholder: this.props.placeholder,
              menuStyles:  menuStyles(this.state.menuOpen),
              onChangeCheckbox: this.onChangeCheckbox({
                data:      this.props.data,
                onChange:  this.props.onChange,
              })
            })
            :
            this.renderInputSelect({
              style:      this.props.style,
              data:       this.props.data,
              labelIndex: this.props.labelIndex,
              onChange:   this.props.onChange,
              dataSource: this.props.dataSource,
              menuStyles: menuStyles(this.state.menuOpen),
            })
          }

        </div>
      </>
    )
  }
}

export default SelectObjects

