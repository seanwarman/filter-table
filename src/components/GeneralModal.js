import React from 'react'
import { Modal, Button } from 'antd'

export function openModal({
  modalTitle,
  modalOkButton,
  modalHeading,
  modalBody
}) {
  this.setState({
    _modalLoading:  false,
    _modalVisible:  true,
    _modalOkButton: modalOkButton,
    _modalTitle:    modalTitle,
    _modalHeading:  modalHeading,
    _modalBody:     modalBody,
  })
}

export function renderModal(props) {

  if(!props) props = {}

  const closeModal = () => {
    this.setState({ _modalLoading: false, _modalVisible: false })
  }

  const startLoading = () => {
    this.setState({ _modalLoading: true })
  }

  return (
    <Modal
      title={this.state._modalTitle && this.state._modalTitle}
      visible={this.state._modalVisible}
      onCancel={closeModal}
      footer={
        <>
          <Button key="back" onClick={closeModal}>
            Cancel
          </Button>
          {
            this.state._modalOkButton && 
            typeof this.state._modalOkButton === 'function' ?
            this.state._modalOkButton(
              this.state._modalLoading,
              startLoading,
              closeModal
            )
              :
              this.state._modalOkButton
          }
        </>
      }
      {...props}
    >
      <div style={{textAlign: 'center'}}>
        <h5>{this.state._modalHeading && this.state._modalHeading}</h5>
        {
          this.state._modalBody && 
          typeof this.state._modalBody === 'function' ?
          this.state._modalBody(
            this.state._modalLoading,
            startLoading,
            closeModal
          )
            :
            this.state._modalBody
        }
      </div>
    </Modal>

  )
}
