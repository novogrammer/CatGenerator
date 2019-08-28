#MITライセンスとのことなので、改変して使わせていただきました。
#https://qiita.com/taku-buntu/items/0093a68bfae0b0ff879d
#https://github.com/taku-buntu/Keras-DCGAN-killmebaby

from keras.layers import Input, Dense, Reshape
from keras.layers import BatchNormalization, Activation
from keras.layers.convolutional import UpSampling2D, Conv2D
from keras.models import Sequential, Model
import tensorflow as tf
from keras.backend import tensorflow_backend

import numpy as np



class DCGAN():
    def __init__(self,disable_gpu=False):
        if disable_gpu:
            config = tf.ConfigProto(device_count={"GPU":0})
            session = tf.Session(config=config)
            tensorflow_backend.set_session(session)
        else:
            config = tf.ConfigProto(gpu_options=tf.GPUOptions(allow_growth=True))
            session = tf.Session(config=config)
            tensorflow_backend.set_session(session)

        self.z_dim = 100
        self.generator = self.build_generator()

    def build_generator(self):
        noise_shape = (self.z_dim,)

        model = Sequential()

        model.add(Dense(128 * 32 * 32, activation="relu", input_shape=noise_shape))
        model.add(Reshape((32, 32, 128)))
        model.add(BatchNormalization(momentum=0.8))
        model.add(UpSampling2D())
        model.add(Conv2D(128, kernel_size=3, padding="same"))
        model.add(Activation("relu"))
        model.add(BatchNormalization(momentum=0.8))
        model.add(UpSampling2D())
        model.add(Conv2D(64, kernel_size=3, padding="same"))
        model.add(Activation("relu"))
        model.add(BatchNormalization(momentum=0.8))
        model.add(Conv2D(3, kernel_size=3, padding="same"))
        model.add(Activation("tanh"))

        model.summary()

        noise = Input(shape=noise_shape)
        img = model(noise)

        return Model(noise, img)



