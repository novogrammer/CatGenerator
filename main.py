from flask import Flask,escape,request,render_template,make_response
from dcgan_slim import DCGAN
import tensorflow as tf
import numpy as np
import imageio
import time
import mimetypes

mimetypes.add_type('application/wasm','.wasm')

#$ pip freeze > requirements.txt
#$ pip install -r requirements.txt

app=Flask(__name__,static_folder='assets')
dcgan = DCGAN(disable_gpu=True)

dcgan.generator.load_weights("ganmodels/dcgan-cat.h5")
global graph
graph = tf.get_default_graph()

@app.route('/')
def index():
    return render_template('index.html')

@app.route('/text/<string:query_text>',methods=['GET'])
def text(query_text):
    response=make_response()
    response.mimetype="text/plain"
    response.data="query_text=\""+query_text+"\""
    time.sleep(3)#simulate slow response
    return response

@app.route('/cat/<string:noise_string>',methods=['GET'])
def cat(noise_string):
    response=make_response()
    response.mimetype="image/png"
    z_dim=100
    noise_string=noise_string+'00'*z_dim
    noise=[0]*z_dim
    for i in range(z_dim):
        n=int(noise_string[i*2:i*2+2],16)
        noise[i]=((n/255)-0.5)*2
    noise=np.array([noise])
    gen_imgs=predict(noise)
    if len(gen_imgs)<1:
        return make_response('predict failed.', 500)
    response.data=imageio.imwrite(imageio.RETURN_BYTES,gen_imgs[0],".png")
    return response

def predict(noise):
    with graph.as_default():
        gen_imgs = dcgan.generator.predict(noise)
        gen_imgs = 0.5 * gen_imgs + 0.5
        return gen_imgs




if __name__=="__main__":
    app.run(debug=True,host="0.0.0.0")

