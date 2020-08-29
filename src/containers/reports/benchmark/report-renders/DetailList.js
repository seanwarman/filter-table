import React from 'react'
import Value from '../Value.js'

function DetailList({
  targetOutput
}) {

  const { output } = targetOutput

  if(!output) return null

  const { detail } = output

  if(!detail) return null

  return (
    <div>

      <h5>Detail</h5>

      <ul>

        {
          Object.keys(detail).map((key, i) => (

            <li key={i}>
              {key}: <Value value={detail[key]} />
            </li>

          ))
        }

      </ul>

    </div>
  )
}

export default DetailList
