import classNames from 'classnames';
import _ from 'lodash';
import React, { Component } from 'react';

import Options from '../Options';
import ColorPicker from './ColorPicker';

import './transform-controls.css';

const TRANSFORM_OPTIONS = Options.defaultControls.transforms.options;

const createRandomTransform = () => TRANSFORM_OPTIONS.reduce((update, option) => {
  update[option.name] = _.random(option.minValue, option.maxValue);
  return update;
}, {});

const RANGE_SCALE = 1000;

const RangeControl = props => (
  <div
    className={`transform-control__range transform-control__range--${props.name}`}
  >
    <input
      type="range"
      min={props.minValue * RANGE_SCALE}
      max={props.maxValue * RANGE_SCALE}
      value={props.value * RANGE_SCALE}
      onChange={evt => props.onChange(evt.target.value / RANGE_SCALE)}
    />
  </div>
);

class TransformControl extends Component {
  constructor(props){
    super(props);

    this.state = {
      isColorPickerOpen: false,
    };
  }

  render(){
    const {
      actualProbability,
      color,
      colors,
      onChange,
      onRemove,
      transform,
      transformIndex,
    } = this.props;

    const probability = Math.floor(actualProbability * 10000) / 100;

    const colorEl = color && (
      <div
        className={classNames('transform-controls__transform-color', {
          'transform-controls__transform-color--light': Options.lightColorLookup.has(color),
        })}
        style={{background: color}}
        onClick={() => this.setState({isColorPickerOpen: true})}
      >
        edit color
      </div>
    );

    return (
      <div className="transform-controls__transform">
        <h4 className="transform-controls__transform-header">
          Transform {transformIndex + 1}
          <span
            className="transform-controls__transform-probability"
            title={`There is (approximately) a ${probability}% chance of this transform being selected`}
          >
            ~{probability}%
          </span>
          <div className="transform-controls__transform-buttons">
            {colorEl}
            <button
              className="transform-controls__transform-button transform-controls__transform-button--shuffle"
              onClick={() => onChange(createRandomTransform())}
            />
            {onRemove && (
              <button
                className="transform-controls__transform-button transform-controls__transform-button--trash"
                onClick={onRemove}
              />
            )}
          </div>
        </h4>

        {
          TRANSFORM_OPTIONS.map(option => (
            <RangeControl
              key={option.name}
              name={option.name}
              minValue={option.minValue}
              maxValue={option.maxValue}
              value={transform[option.name]}
              onChange={value => onChange(Object.assign({}, transform, {
                [option.name]: value,
              }))}
            />
          ))
        }

        {color && (
          <ColorPicker
            colors={colors}
            color={color}
            open={this.state.isColorPickerOpen}
            onChange={this.props.onColorChange}
            onClose={() => this.setState({isColorPickerOpen: false})}
          />
        )}
      </div>
    );
  }
}

export default ({colors, onColorChange, fixedNumTransforms, onChange, transforms}) => {
  const updateTransform = (index, updatedTransform) => {
    const updatedTransforms = transforms.slice();
    updatedTransforms[index] = updatedTransform;
    onChange(updatedTransforms);
  };

  const updateColors = (index, newColor) => {
    const newColors = colors.slice();
    newColors[index] = newColor;
    onColorChange(newColors);
  };

  const totalProbability = transforms.reduce((acc, {probability}) => acc + probability, 0);

  return (
    <div className="transform-controls">
      <div className="transform-controls__buttons">
        <button
          className="btn btn--inline"
          onClick={() => onChange(transforms.map(() => createRandomTransform()))}
        >
          randomize transforms
        </button>

        <button
          className="btn btn--inline"
          onClick={() => {
            onChange(transforms.map(() =>
              Options.defaultControls.transforms.createTransform()));
          }}
        >
          reset transforms
        </button>
      </div>

      {
        transforms.map((transform, index) => (
          <TransformControl
            key={`transform-${index}`}
            colors={colors}
            color={colors && colors[index]}
            onColorChange={newColor => updateColors(index, newColor)}
            actualProbability={transform.probability / totalProbability}
            transform={transform}
            transformIndex={index}
            onChange={updatedTransform => updateTransform(index, updatedTransform)}
            onRemove={transforms.length > 1 && !fixedNumTransforms && (() =>
              onChange([...transforms.slice(0, index), ...transforms.slice(index +1)]))}
          />
        ))
      }

      {!fixedNumTransforms && (
        <button
          className="btn btn--block-center"
          onClick={() =>
            onChange([...transforms, Options.defaultControls.transforms.createTransform()])}
        >
          add transform
        </button>
      )}
    </div>
  );
};