import { Button, ButtonGroup, colors } from '@mui/material';
import React from 'react';

interface Props {
  setAddliquidity: (param: boolean) => void;
}

const SwitchButton: React.FC<Props> = (props) => {
  const { setAddliquidity } = props;
  const changeStyle = (addLiquidity: boolean) => {
    if (addLiquidity) {
      const add_button = document.getElementById('add-button');
      if (add_button) {
        add_button.style.backgroundColor = colors.blue[800];
      }
      const remove_button = document.getElementById('remove-button');
      if (remove_button) {
        remove_button.style.backgroundColor = colors.blueGrey[900];
      }
    } else {
      const remove_button = document.getElementById('remove-button');
      if (remove_button) {
        remove_button.style.backgroundColor = colors.blue[800];
      }
      const add_button = document.getElementById('add-button');
      if (add_button) {
        add_button.style.backgroundColor = colors.blueGrey[900];
      }
    }
  };

  return (
    <>
      <ButtonGroup
        size="large"
        variant="contained"
        sx={{
          width: '100%',
          '& .MuiButton-root': {
            flex: 1, // 让按钮宽度均分
          },
          height:'50px'
        }}
      >
        <Button
          id="add-button"
          sx={(theme) => ({
            color: '#F1F1F3',
            bgcolor: theme.palette.addLiquidity.addLiquidityButton,
            '&:hover': {
              bgcolor: '#303F9F',
            },
          })}
          onClick={() => {
            setAddliquidity(true);
            changeStyle(true);
          }}
        >
          Add Liquidity
        </Button>
        <Button
          id="remove-button"
          sx={(theme) => ({
            color: '#F1F1F3',
            bgcolor: theme.palette.addLiquidity.removeLiquidityButton,
            '&:hover': {
              bgcolor: '#c51162',
            },
          })}
          onClick={() => {
            setAddliquidity(false);
            changeStyle(false);
          }}
        >
          Remove Liquidity
        </Button>
      </ButtonGroup>
    </>
  );
};

export default SwitchButton;
