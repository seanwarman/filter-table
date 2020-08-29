import { Cascader } from 'antd';
import React, { Component } from 'react';

class BigglyGetMenu extends Component {

  // █▀▀ ▀▀█▀▀ █▀▀█ ▀▀█▀▀ █▀▀   █▀▀█ █▀▀ █▀▀ ░▀░ █▀▀▄ █▀▀▀ █▀▄▀█ █▀▀ █▀▀▄ ▀▀█▀▀ █▀▀
  // ▀▀█ ░░█░░ █▄▄█ ░░█░░ █▀▀   █▄▄█ ▀▀█ ▀▀█ ▀█▀ █░░█ █░▀█ █░▀░█ █▀▀ █░░█ ░░█░░ ▀▀█
  // ▀▀▀ ░░▀░░ ▀░░▀ ░░▀░░ ▀▀▀   ▀░░▀ ▀▀▀ ▀▀▀ ▀▀▀ ▀░░▀ ▀▀▀▀ ▀░░░▀ ▀▀▀ ▀░░▀ ░░▀░░ ▀▀▀

  state = {
    options: null,
    initialOption: null,
    selection: false,
  };

  // █░░ ░▀░ █▀▀ █▀▀ █▀▀ █░░█ █▀▀ █░░ █▀▀   █░░█ █▀▀█ █▀▀█ █░█ █▀▀
  // █░░ ▀█▀ █▀▀ █▀▀ █░░ █▄▄█ █░░ █░░ █▀▀   █▀▀█ █░░█ █░░█ █▀▄ ▀▀█
  // ▀▀▀ ▀▀▀ ▀░░ ▀▀▀ ▀▀▀ ▄▄▄█ ▀▀▀ ▀▀▀ ▀▀▀   ▀░░▀ ▀▀▀▀ ▀▀▀▀ ▀░▀ ▀▀▀

  async componentDidMount() {

    let initialOption = [];
    const typeDisplay = this.props.menuOptions[0].typeDisplay;
    const get = this.props.menuOptions[0].get;

    let isLeaf = this.props.menuOptions[0].isLeaf;
    let optionKey = this.props.menuOptions[0].optionKey;
    let disabled = false;
    let getKeys;
    if(this.props.menuOptions[0].getKey) {  
      getKeys = [this.props.menuOptions[0].getKey];
    } else if(this.props.menuOptions[0].getKeys) {
      getKeys = this.props.menuOptions[0].getKeys;
    }

    try {
      if(getKeys) {
        initialOption = await get(this.props.apiKey, ...getKeys);
      } else {
        initialOption = await get(this.props.apiKey);
      }
    } catch (err) {
      console.log(err);
      throw err;
    }

    if((initialOption || []).length === 0) {
      initialOption = [{ message: `No ${typeDisplay} to display` }];
      optionKey = 'message';
      isLeaf = true;
      disabled = true;
    }
    let options = this.giveArrayCascaderKeys(initialOption, optionKey, { type: typeDisplay, isLeaf, disabled });

    this.setState({ initialOption, options });

  }

  // █▀▀ █░░█ █▀▀ ▀▀█▀▀ █▀▀█ █▀▄▀█   █▀▄▀█ █▀▀ ▀▀█▀▀ █░░█ █▀▀█ █▀▀▄ █▀▀
  // █░░ █░░█ ▀▀█ ░░█░░ █░░█ █░▀░█   █░▀░█ █▀▀ ░░█░░ █▀▀█ █░░█ █░░█ ▀▀█
  // ▀▀▀ ░▀▀▀ ▀▀▀ ░░▀░░ ▀▀▀▀ ▀░░░▀   ▀░░░▀ ▀▀▀ ░░▀░░ ▀░░▀ ▀▀▀▀ ▀▀▀░ ▀▀▀

  giveArrayCascaderKeys = (array, labelKeyString, extraOptions) => {
    let childrenArray = array.map( (item, index) => {
      let labelCopy = '';
      if(labelKeyString && typeof labelKeyString !== 'string') {
        labelKeyString.forEach( label => {
          labelCopy+= ' ' + item[label];
        });
      } else {
        labelCopy = item[labelKeyString];
      }
      return {
        // the `value` here is also used as the iteration key so it needs to be unique.
        value: (labelCopy + index),
        label: labelCopy,
        ...extraOptions,
        ...item
      };
    });

    if(this.props.sort === undefined || this.props.sort === true) {
      childrenArray.sort((a, b) => {
        let valueA = (JSON.stringify(a.value) || '').toUpperCase(); // ignore upper and lowercase
        let valueB = (JSON.stringify(b.value) || '').toUpperCase(); // ignore upper and lowercase
        if (valueA < valueB) {
          return -1;
        }
        if (valueA > valueB) {
          return 1;
        }

        // names must be equal
        return 0;
      });
    }

    // Add a little title to the column...
    childrenArray.unshift({
      value: 'title',
      type: extraOptions.type,
      label: extraOptions.type,
      isLeaf: true,
      disabled: true
    });

    return childrenArray;
  };

  emitSelection = (selectedOptions, emitCallback) => {
    // if(selectedOptions.length < 1) return;
    // TODO: 107 This function is called when the option's isLeaf is set to false
    // We get all the options here and so we just grab the last one...
    let option = selectedOptions[selectedOptions.length - 1];
    this.setState({selection: true});
    emitCallback(option, selectedOptions);
  }

  loadData = async (selectedOptions) => {

    const iteration = selectedOptions.length;
    const selectedOption = selectedOptions[selectedOptions.length - 1];
    selectedOption.loading = true;

    const get = this.props.menuOptions[iteration].get;
    const type = this.props.menuOptions[iteration].typeDisplay;

    let getKeys = [];

    if(this.props.menuOptions[iteration].getKeys)  {
      getKeys = this.props.menuOptions[iteration].getKeys.map( key => selectedOption[key] );
    }


    let cascadeLabel = this.props.menuOptions[iteration].optionKey;

    let isLeaf = this.props.menuOptions[iteration].isLeaf;
    let disabled = false;
    let result;

    let partnerKey = null;

    try {
      result = await get(this.props.apiKey, ...getKeys);
    } catch (err) {
      console.log(`There was an error with the BigglyGetMenu endpoint for ${type}:`);
      console.log(err);
      throw err;
    }

    if(result.length < 1) {
      // If there are no children we want to display a little message...
      result = [{message: `No ${type.toLowerCase()} to display.` }];
      isLeaf = true;
      cascadeLabel = 'message';
      disabled = true;
    }

    selectedOption.children = this.giveArrayCascaderKeys(result, cascadeLabel, { type, isLeaf, disabled, partnerKey });
    selectedOption.loading = false;
    this.setState({
      options: [...this.state.options]
    });
  }

  renderValue = () => {
    if(this.state.selection) return;
    const { defaultValue } = this.props;
    if((defaultValue || '').length === 0) return;
    return defaultValue;
  }

  // █▀▀█ █▀▀ █▀▀▄ █▀▀▄ █▀▀ █▀▀█
  // █▄▄▀ █▀▀ █░░█ █░░█ █▀▀ █▄▄▀
  // ▀░▀▀ ▀▀▀ ▀░░▀ ▀▀▀░ ▀▀▀ ▀░▀▀

  render() {
    const { menuSelectionFunction, cascaderAttr } = this.props;

    return (
      <div style={{position: 'relative'}}>
        <div
          style={{
            position: 'absolute',
            zIndex: 1,
            left: 12,
            top: 6,
            pointerEvents: 'none',
          }}
        >
          {
            this.renderValue()
          }
        </div>
        <Cascader
          {...cascaderAttr}
          placeholder={
            this.renderValue() ? 
            ''
            :
            'Please select'
          }
          options={this.state.options}
          loadData={this.loadData}
          onChange={(value, selectedOptions) => {
            this.emitSelection(selectedOptions, menuSelectionFunction.bind(this));
          }}
        />
      </div>
    );
  }
}

export default BigglyGetMenu;
