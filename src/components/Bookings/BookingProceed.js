import React from 'react';
import { 
  Icon,
  Button, 
  Steps,
  Card,
  Popconfirm,
  Tooltip,
} from 'antd';
const {Step} = Steps;

export default class BookingProceed extends React.Component {
  state = {
    loading: true,
    renderProgress: null
  }

  componentDidMount() {
    this.loadDataAndSetState()
  }

  loadDataAndSetState() {
    let stateCopy = {...this.state};

    stateCopy.renderProgress = this.renderProgress;

    stateCopy.loading = false;
    this.setState(stateCopy);
  }

  renderProgress = () => {
    const {
      loading,
    } = this.state;
    const { jsonStatus, flags, currentStatus } = this.props;

    return (
      !loading &&
      <Card
        id={
          (flags || []).includes('queried') ?
          'query-mode'
          :
          ''
        }
        querytext="Query Mode"
        style={{
          marginBottom: '16px',
          backgroundColor: this.props.color || '#F0F2F5',
          borderStyle: 'dashed',
          ...this.props.style
        }}
      >
        {
          this.props.onClose &&
          <div
            style={{
              textAlign: 'right'
            }}
          >
            <Icon 
              style={{
                position: 'relative',
                top: -15,
                right: -10
              }}
              type="close"
              onClick={this.props.onClose}
            />
          </div>
        }
        <div>
          <Steps size={this.props.size || ''} current={jsonStatus.findIndex(json => json.value === currentStatus)} 
            style={{ 
              padding: this.props.size === 'small' ? 0 : '2rem'
            }}
          >
            {jsonStatus.map((status, index) =>
              <Step key={index} title={status.value} />
            )}
          </Steps>
        </div>
        <div style={{ textAlign: 'right' }}>
          {this.props.customButtons && this.props.customButtons(this.props.disabled ? this.props.disabled : false)}
          {this.renderProceedButton()}
        </div>
      </Card>
    );
  };

  renderProceedButton = () => {
    const {
      currentStatus,
      jsonStatus,
      rolesCurrentlyAllowedToAffect,
      update,
      validation,
      size,
      disabled,
      reload,
    } = this.props;

    let invalidReason = null;

    const buttonType = this.props.buttonType ? this.props.buttonType : 'Proceed'; 

    const canOrCant = function() {
      const validationObjOrBool = validation(rolesCurrentlyAllowedToAffect);
      if(typeof validationObjOrBool !== 'boolean' && typeof validationObjOrBool.valid !== 'boolean') {
        console.error('The Proceed button\'s validation property needs to return a boolean or an object like: {valid: false, reason: "reason it\'s not valid"}.');
        return;
      }
      invalidReason = validationObjOrBool.reason || 'Not allowed';
      if(typeof validationObjOrBool.valid === 'boolean' ? validationObjOrBool.valid : validationObjOrBool) {
        return 'Can';
      } else {
        return 'Cant';
      }
    }()

    const proceedButtonState = {
      // TODO: Much of this code is redundant. It'll be better to have a props value for the button
      // text which we can define in the parent under something like canText and cantText. 
      // Then make this render simply Can or Can't proceed based on the roleCurrentlyAllowedToAffect and the booking.
      // Then this component should just display the jsonStatus and spit out a progressed jsonStatus object
      //  when update is called.
      Proceed: {
        Can: {
          handleButton: async function() {
            let currentIndex = jsonStatus.findIndex(item => item.value === currentStatus);

            if(currentIndex === -1) {
              currentIndex = 0;
            }


            let newJsonStatus = JSON.parse(JSON.stringify(jsonStatus));
            newJsonStatus[currentIndex].selected = false;
            newJsonStatus[currentIndex + 1].selected = true;


            const nextStatus = (newJsonStatus[currentIndex + 1] || {}).value

            await update(newJsonStatus, nextStatus);
          },
          renderButton: function() {
            return (
              <Popconfirm
                onConfirm={this.handleButton}
                title="Are you sure?"
              >
                <Button
                  size={size || 'default'}
                  onClick={e => reload && reload()}
                  disabled={
                    disabled ?
                    disabled
                    :
                    false
                  }
                  loading={false}
                >Proceed</Button>
              </Popconfirm>
            )
          }
        },
        Cant: {
          handleButton: function() {
            console.log('Not allowed');
          },
          renderButton: function() {
            return (
              <Tooltip title={invalidReason}>
                <Button 
                  size={size || ''}
                  loading={false}
                  disabled={true}
                >Proceed</Button>
              </Tooltip>
            )
          }
        }
      },
      Assign: {
        Can: {
          handleButton: async function() {
            let currentIndex = jsonStatus.findIndex(item => item.value === currentStatus);

            if(currentIndex === -1) {
              currentIndex = 0;
            }


            let newJsonStatus = JSON.parse(JSON.stringify(jsonStatus));
            newJsonStatus[currentIndex].selected = false;
            newJsonStatus[currentIndex + 1].selected = true;


            const nextStatus = (newJsonStatus[currentIndex + 1] || {}).value

            await update(newJsonStatus, nextStatus);
          },
          renderButton: function() {
            return (
              <Popconfirm
                onConfirm={this.handleButton}
                title="Are you sure?"
              >
                <Button 
                  size={size || 'default'}
                  onClick={e => reload && reload()}
                  disabled={
                    disabled ?
                    disabled
                    :
                    false
                  }
                  loading={false}
                >Assign To Me</Button>
              </Popconfirm>
            )
          }
        },
        Cant: {
          handleButton: function() {
            console.log('Not allowed');
          },
          renderButton: function() {
            return (
              <Tooltip title={invalidReason}>
                <Button 
                  size={size || ''}
                  disabled={true}
                  loading={false} 
                >Assign To Me</Button>
              </Tooltip>
            )
          }
        }
      }
    }
    return (
      <div
        style={{
          marginTop: size === 'small' ? 19 : 0 
        }}
      >
        {proceedButtonState[buttonType][canOrCant].renderButton()}
      </div>
    )
  }

  render = () => (
    this.state.renderProgress &&
    this.state.renderProgress()
  )
}
