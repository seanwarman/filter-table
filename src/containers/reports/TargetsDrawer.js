import React from 'react'
import {
  Drawer,
  Input,
} from 'antd'
import DefaultTargets from './DefaultTargets.js'

export default function TargetsDrawer({
  cheerioTargets,
  onChange,
  ...props
}) {

  function setTargetByType(inputVal, outputVal) {
    if(!inputVal) return outputVal
    if(typeof inputVal === 'string') return outputVal
    if(typeof inputVal === 'object') return outputVal.split(',')
  }

  function returnNewTargets(key, val, index) {
    return cheerioTargets.map((target, i) => {
      if(index === i) return {
        ...target,
        input: {
          ...target.input,
          [key]: setTargetByType(target.input[key], val)
        }
      }
      return target
    })
  }

  return (
    <Drawer width={600} {...props}>
      {
        cheerioTargets.map((target, i) => (

        target.input &&

        <DefaultTargets
          target={target}
          key={i}
        >
          {
            Object.keys(target.input).map((key, keyI) => <div key={keyI}>

              <b>{key}:</b> 
              <Input
                defaultValue={target.input[key]}
                onChange={e => onChange(returnNewTargets(key, e.target.value, i))}
              />

            </div>)
            }
          </DefaultTargets>
        ))
      }
    </Drawer>
  )

}


