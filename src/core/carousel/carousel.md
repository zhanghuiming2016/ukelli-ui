carousel，可以参考默认的动画，设置自己的动画

```js
<Carousel
  styleConfig={{
    width: 500,
    height: 200
  }}
  carouselItems={[
    {
      imgUrl: 'https://tse1.mm.bing.net/th?id=OIP.2r73X7SmOy1zmFh_2YhbTwHaHa&pid=Api',
      action: () => alert('点击了 img')
    },
    {
      element: (
        <div>测试用例</div>
      )
    }
  ]}/>
```