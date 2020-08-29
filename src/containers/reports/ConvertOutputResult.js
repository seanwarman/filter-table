import React from 'react'

export default function ConvertOutputResult({
  result
}) {
  const style = {
    height: '24px',
    overflow: 'hidden'
  }

  if(typeof result === 'number') return <h4><div style={{color: '#40a9ff'}}>{result}</div></h4>
  if(typeof result === 'boolean') return result ?
    <h4><span style={{color: '#73d13d'}}>&#10003;</span></h4>
    :
    <h4><span style={{color: '#fa541c'}}>X</span></h4>


  if(result instanceof Array) return result.map((item, i) => 
    <div style={style} key={i}>{ConvertOutputResult({ result: item })}</div>
  )

  if(result instanceof Object) return Object.keys(result).map((key, i) => 
    <div style={{display: 'flex'}} key={i}>
      <b>{key}</b>: &nbsp; <i>{ConvertOutputResult({ result: result[key] })}</i>
    </div>
  )

  if(result === 'error') return <h4><span style={{color: '#fa541c'}}>Error</span></h4> 

  if(typeof result === 'string') {
    try {
      return ConvertOutputResult({ result: JSON.parse(result) })
    } catch (err) {
      return <div style={style}>{JSON.stringify(result)}<br /></div>
    }
  }


  return JSON.stringify(result)


}


