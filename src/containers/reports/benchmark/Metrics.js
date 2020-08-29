import React from 'react'
import { Chart } from 'react-google-charts'
import { Icon, Col, Row } from 'antd'

function title(text) {
  const title = text.replace(/([A-Z])/g, ' $1')
  return title.charAt(0).toUpperCase() + title.slice(1)
}

function parser(result, expect) {

  const data = Object.keys(result).map(key => ({ 

    resulting: [ result[key] ],
    label: key,
    expected: expect[key].range

  }))

  return data

}

function options(min, max) {
  return {
    greenFrom: 0,
    greenTo: min,
    yellowFrom: min,
    yellowTo: max,
    redFrom: max,
    redTo: max + (max - min),
    minorTicks: 0,
    majorTicks: 0,
    max: max + (max - min),
    greenColor: '#8fea8f',
    yellowColor: '#ffc773',
    redColor: '#fd7272'
  }
}

function Metrics({
  targetOutput
}) {

  if(!targetOutput) return null

  const { expect, output } = targetOutput

  const { result } = output

  if(!result) return null

  return (

    <Row>

      {
        parser(result, expect).map((data, i) => {

          const [ min, max ] = data.expected

          return <Col 
            style={{
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'center',
              alignItems: 'center'
            }}
            span={6}
          >

            <h6>{title(data.label)}</h6>

            <Chart
              key={i}
              width={120}
              height={120}
              chartType="Gauge"
              loader={<Icon type="loading" />}
              data={[
                [''],
                data.resulting
              ]}
              options={options(min, max)}
            >
            </Chart>
          </Col>

        })
      }

    </Row>

  )
}

export default Metrics
